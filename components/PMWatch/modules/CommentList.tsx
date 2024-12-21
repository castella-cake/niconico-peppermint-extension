import { useState, useRef, createRef, RefObject, Dispatch, SetStateAction } from "react";
//import { useLang } from "../localizeHook";
import { doFilterComments, secondsToTime, sharedNgLevelScore } from "./commonFunction";
import type { CommentDataRootObject } from "@/types/CommentData";
import { VideoDataRootObject } from "@/types/VideoData";
import { NicoruKeyResponseRootObject, NicoruPostBodyRootObject, NicoruPostResponseRootObject, NicoruRemoveRootObject } from "@/types/NicoruPostData";
import { getNicoruKey, postNicoru, removeNicoru } from "../../../utils/watchApi";
import { useStorageContext } from "@/hooks/extensionHook";

type scrollPos = {
    [vposSec: string]: RefObject<HTMLDivElement>
}
/*
// 選択した名前のスレッドを返す関数
// 同名のforkがある場合はidが遅い方を返します(dアニメのため)
function returnSelectedThread(threads: Thread[], forkName: string) {
    const filteredThreads = threads.filter(elem => elem.fork === forkName ).sort((a, b) => {
        return Number(b.id) - Number(a.id)
    })
    if ( filteredThreads.length > 0 ) {
        return filteredThreads[0]
    } else {
        return false
    }
}*/

const forkLabelToLang: { [key: string]: string} = {
    "default": "メイン",
    "community": "コミュニティ",
    "easy": "かんたん",
    "owner": "オーナー",
    "nicos": "ニコス",
    "extra-community": "引用コミュニティ",
    "extra-easy": "引用かんたん",
}

function getDefaultThreadIndex(videoInfo: VideoDataRootObject) {
    return videoInfo.data?.response.comment.threads.findIndex(elem => elem.isDefaultPostTarget) ?? 0
}

function returnFirstScrollPos(scrollPosList: scrollPos) {
    for (const elem in scrollPosList) {
        if (scrollPosList[elem].current) return scrollPosList[elem]
    }
    
}

type Props = {
    videoInfo: VideoDataRootObject,
    commentContent: CommentDataRootObject,
    setCommentContent: Dispatch<SetStateAction<CommentDataRootObject>>,
    videoRef: RefObject<HTMLVideoElement>
}

const ariaDetails = "コメントリストはデフォルトでスクリーンリーダーから不可視です。\nコメントリストを読み上げたり、コメントに対してアクションする場合は、このボタンでコメントリストを開放することが出来ます。"

function CommentList(props: Props) {
    //const lang = useLang()
    const { localStorage } = useStorageContext()
    const [ currentForkType, setCurrentForkType ] = useState(-1)
    const [ isCommentListHovered, setIsCommentListHovered ] = useState(false)
    const [ autoScroll, setAutoScroll ] = useState(true)
    const [ openedCommentItem, setOpenedCommentItem ] = useState<string>("")
    const [ listFocusable, setListFocusable ] = useState(false)

    const commentListContainerRef = useRef<HTMLDivElement>(null)
    // 複数のref
    const commentRefs = useRef<RefObject<HTMLDivElement>[]>([])

    const videoInfoRef = useRef<VideoDataRootObject | null>(null)
    videoInfoRef.current = props.videoInfo

    const commentContentRef = useRef<CommentDataRootObject | null>(null)
    commentContentRef.current = props.commentContent

    // スクロールタイミングを書いたオブジェクト
    const scrollPosList: scrollPos = {}

    function updateScrollPosition() {
        // データが足りない/オートスクロールが有効化されていない/コメントリストにホバーしている ならreturn
        if (!videoInfoRef.current?.data || !commentContentRef.current?.data || !props.videoRef.current || !autoScroll || isCommentListHovered || !scrollPosList) return
        // video要素の時間
        const currentTime = Math.floor(props.videoRef.current.currentTime)
        // とりあえず一番最初の要素の高さを取得
        const firstScrollPos = returnFirstScrollPos(scrollPosList)
        if (!firstScrollPos || !firstScrollPos.current || !scrollPosList[`${currentTime}` as keyof scrollPos] || !commentListContainerRef.current) return

        const elemHeight = firstScrollPos.current.offsetHeight
        const listHeight = commentListContainerRef.current.clientHeight
        const listPosTop = commentListContainerRef.current.offsetTop
        const currentTimeElem = scrollPosList[`${currentTime}` as keyof scrollPos].current
        if (!currentTimeElem) return 
        // offsetTopがでかいのでリスト自身の上からの座標を与えて正しくする
        const elemOffsetTop = currentTimeElem.offsetTop - listPosTop

        // リストの高さからはみ出していればスクロール
        if ( elemOffsetTop - listHeight > 0 ) {
            // そのまま座標を与えると上に行ってしまうので、リストの高さから1個分のアイテムの高さを引いて下からにする
            commentListContainerRef.current.scrollTop = elemOffsetTop - (listHeight - elemHeight)
        }
    }

    updateScrollPosition()
    useEffect(() => {
        if ( !props.videoRef.current ) return
        props.videoRef.current.addEventListener("timeupdate", updateScrollPosition)
        return () => props.videoRef.current?.removeEventListener("timeupdate", updateScrollPosition)
    }, [props.videoRef.current, autoScroll, isCommentListHovered, scrollPosList])

    // 現在のフォークタイプで代入
    const commentContent = props.commentContent.data
    const currentThread = commentContent?.threads[currentForkType]
    // 早い順にソート
    const filteredComments = useMemo(() => {
        if (!currentThread) return
        const sortedComments = currentThread.comments.sort((a,b) => {
            if ( a.vposMs > b.vposMs ) return 1
            if ( a.vposMs < b.vposMs ) return -1
            return 0
        })
        return doFilterComments(sortedComments, sharedNgLevelScore[(localStorage.playersettings.sharedNgLevel ?? "mid") as keyof typeof sharedNgLevelScore], props.videoInfo.data?.response.comment.ng.viewer)
    }, [currentThread, localStorage.playersettings.sharedNgLevel, props.videoInfo])


    // データが足りなかったら閉店
    if (!props.videoInfo.data || !props.commentContent.data) return <></>

    // currentForkTypeが-1の場合は入れ直す
    if (currentForkType === -1) setCurrentForkType(getDefaultThreadIndex(props.videoInfo))

    //const videoInfo = props.videoInfo.data.response

    // 指定したフォークタイプのスレッドが見つからなかったらreturn
    if (!currentThread) return <></>
    // refを登録
    filteredComments?.forEach((elem, index) => {
        commentRefs.current[index] = createRef()
        if ( commentRefs.current[index] != null ) {
            scrollPosList[`${Math.floor( elem.vposMs / 1000 )}`] = commentRefs.current[index]
        }
    })

    async function onNicoru(commentNo: number, commentBody: string, nicoruId: string | null) {
        //"{\"videoId\":\"\",\"fork\":\"\",\"no\":0,\"content\":\"\",\"nicoruKey\":\"\"}"
        if (!props.videoInfo.data || !props.videoInfo.data.response.video.id || !props.videoInfo.data.response.viewer || !props.videoInfo.data.response.viewer.isPremium || !props.commentContent.data) return
        if (nicoruId) {
            const response: NicoruRemoveRootObject = await removeNicoru(nicoruId)
            if ( response.meta.status === 200 ) {
                const commentContentCopy: typeof props.commentContent = JSON.parse(JSON.stringify(props.commentContent))
                const comments = commentContentCopy.data!.threads[currentForkType].comments
                const thisComment = comments[comments.findIndex((comment) => comment.no === commentNo)]
                if (!thisComment) return
                thisComment.nicoruCount = thisComment.nicoruCount - 1
                thisComment.nicoruId = null
                props.setCommentContent(commentContentCopy)
            }
        } else {
            const currentThread = props.videoInfo.data.response.comment.threads[currentForkType]
            const nicoruKeyResponse: NicoruKeyResponseRootObject = await getNicoruKey(currentThread.id, currentThread.forkLabel)
            if (nicoruKeyResponse.meta.status !== 200) return
            const body: NicoruPostBodyRootObject = {videoId: props.videoInfo.data.response.video.id, fork: currentThread.forkLabel, no: commentNo, content: commentBody, nicoruKey: nicoruKeyResponse.data.nicoruKey} 
            const response: NicoruPostResponseRootObject = await postNicoru(currentThread.id, JSON.stringify(body))
            //console.log(response)
            if (response.meta.status === 201) {
                const commentContentCopy: typeof props.commentContent = JSON.parse(JSON.stringify(props.commentContent))
                const comments = commentContentCopy.data!.threads[currentForkType].comments
                const thisComment = comments[comments.findIndex((comment) => comment.no === commentNo)]
                if (!thisComment) return
                thisComment.nicoruCount = thisComment.nicoruCount + 1
                thisComment.nicoruId = response.data.nicoruId
                props.setCommentContent(commentContentCopy)
            }
        }

    }
    //console.log(scrollPosList)
    function returnNicoruRank(nicoruCount: number) {
        if (nicoruCount >= 9) return 4
        if (nicoruCount >= 5) return 3
        if (nicoruCount >= 3) return 2
        if (nicoruCount >= 1) return 1
        return 0
    }

    function toggleCommentItemExpand(id: string) {
        if ( openedCommentItem === id ) {
            setOpenedCommentItem("")
            return
        }
        setOpenedCommentItem(id)
    }

    function seekTo(time: number) {
        if (props.videoRef.current) {
            props.videoRef.current.currentTime = time
        }
    }

    return <div className="commentlist-container" id="pmw-commentlist">
        <div className="commentlist-title-container global-flex stacker-title">
            <div className="global-flex1 global-bold">
                
            </div>
            <div>
                <select onChange={(e) => {setCurrentForkType(Number(e.currentTarget.value))}} value={currentForkType} className="commentlist-fork-selector" title="コメント種類選択">
                    {props.videoInfo.data.response.comment.threads.map((elem, index) => {
                        const key = elem.label as keyof typeof forkLabelToLang
                        return <option key={`${index}-${elem.fork}-${elem.label}`} value={index}>{forkLabelToLang[key] || elem.label}</option>
                    })}
                </select>
                <label>
                    <input
                        type="checkbox"
                        className="commentlist-autoscroll"
                        onChange={(e) => {setAutoScroll(e.currentTarget.checked)}}
                        checked={autoScroll}
                    />
                    自動スクロール
                </label>
                <button className="commentlist-list-toggletabindex" aria-description={ariaDetails} onClick={() => {setListFocusable(!listFocusable);setAutoScroll(false)}} data-isopen={listFocusable}>コメントリストを{listFocusable ? "閉じる" : "開く"}</button>
            </div>
        </div>
        <div className="commentlist-list-container" ref={commentListContainerRef} onMouseEnter={() => {setIsCommentListHovered(true)}} onMouseLeave={() => setIsCommentListHovered(false)}>
            {filteredComments?.map((elem, index) => {
                //console.log(elem)
                return <div key={elem.id} ref={commentRefs.current[index]} className={`commentlist-list-item ${openedCommentItem.includes(elem.id) ? "commentlist-list-item-open" : ""}`} nicoru-count={returnNicoruRank(elem.nicoruCount)} aria-hidden={!listFocusable}>
                    <button type="button" tabIndex={listFocusable ? undefined : -1} onClick={() => onNicoru(elem.no, elem.body, elem.nicoruId)} className={`commentlist-list-item-nicorubutton ${!props.videoInfo.data?.response.viewer || (!props.videoInfo.data?.response.viewer.isPremium) ? "commentlist-list-item-nicorubutton-disabled" : ""}`}>ﾆｺ{elem.nicoruId && "ｯﾀ"} {elem.nicoruCount}</button>
                    <div className="commentlist-list-item-body" title={elem.body}>{elem.body}</div>
                    <button type="button" tabIndex={listFocusable ? undefined : -1} className="commentlist-list-item-vpos" onClick={() => {toggleCommentItemExpand(elem.id)}} title="コメントの詳細を開く">{secondsToTime(Math.floor( elem.vposMs / 1000 ))}</button>
                    { openedCommentItem === elem.id && <>
                        <div className="commentlist-list-item-stats">
                            <span>コメ番: {elem.no} / 投稿日時: {new Date(elem.postedAt).toLocaleString()}</span>
                            <button onClick={() => {seekTo(elem.vposMs / 1000)}} className="commentlist-list-item-seektobutton">投稿時間にシーク</button>
                        </div>
                    </>}
                </div>
            })}
        </div>
    </div>
}


export default CommentList;
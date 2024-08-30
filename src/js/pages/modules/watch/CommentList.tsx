import { useState, useRef, createRef, RefObject, Dispatch, SetStateAction } from "react";
//import { useLang } from "../localizeHook";
import { useInterval } from "../commonHooks";
import { secondsToTime } from "./commonFunction";
import type { CommentDataRootObject, Thread } from "./types/CommentData";
import { VideoDataRootObject } from "./types/VideoData";
import { NicoruKeyResponseRootObject, NicoruPostBodyRootObject, NicoruPostResponseRootObject, NicoruRemoveRootObject } from "./types/NicoruPostData";
import { getCommentThread, getNicoruKey, postNicoru, removeNicoru } from "../../../modules/watchApi";

type scrollPos = {
    [vposSec: string]: RefObject<HTMLDivElement>

}

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

function CommentList(props: Props) {
    //const lang = useLang()
    const [ currentForkType, setCurrentForkType ] = useState("main")
    const [ isCommentListHovered, setIsCommentListHovered ] = useState(false)
    const [ autoScroll, setAutoScroll ] = useState(true)
    const commentListContainerRef = useRef<HTMLDivElement>(null)
    // 複数のref
    const commentRefs = useRef<RefObject<HTMLDivElement>[]>([])

    // スクロールタイミングを書いたオブジェクト
    const scrollPosList: scrollPos = {}

    useInterval(() => {
        // データが足りない/オートスクロールが有効化されていない/コメントリストにホバーしている ならreturn
        if (!props.videoInfo.data || !props.commentContent.data || !props.videoRef.current || !autoScroll || isCommentListHovered || !scrollPosList) return

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
    }, 500)
    
    // データが足りなかったら閉店
    if (!props.videoInfo.data || !props.commentContent.data) return <></>

    //const videoInfo = props.videoInfo.data.response
    const commentContent = props.commentContent.data

    // 現在のフォークタイプで代入
    const currentThread = returnSelectedThread(commentContent.threads, currentForkType)
    // 指定したフォークタイプのスレッドが見つからなかったらreturn
    if (!currentThread) return <></>

    // 早い順にソート
    const sortedComments = currentThread.comments.sort((a,b) => {
        if ( a.vposMs > b.vposMs ) return 1
        if ( a.vposMs < b.vposMs ) return -1
        return 0
    })
    // refを登録
    sortedComments.forEach((elem, index) => {
        commentRefs.current[index] = createRef()
        if ( commentRefs.current[index] != null ) {
            scrollPosList[`${Math.floor( elem.vposMs / 1000 )}`] = commentRefs.current[index]
        }
    })

    async function reloadCommentData() {
        if (!props.videoInfo.data) return
        const commentRequestBody = {
            params: {
                ...props.videoInfo.data.response.comment.nvComment.params
            },
            threadKey: props.videoInfo.data.response.comment.nvComment.threadKey
        }
        const commentResponse: CommentDataRootObject = await getCommentThread(props.videoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
        props.setCommentContent(commentResponse)
    }

    async function onNicoru(commentNo: number, commentBody: string, nicoruId: string | null) {
        //"{\"videoId\":\"\",\"fork\":\"\",\"no\":0,\"content\":\"\",\"nicoruKey\":\"\"}"
        if (!props.videoInfo.data || !props.videoInfo.data.response.video.id) return
        if (nicoruId) {
            const response: NicoruRemoveRootObject = await removeNicoru(nicoruId)
            if ( response.meta.status === 200 ) {
                reloadCommentData()
            }
        } else {
            const currentThread = props.videoInfo.data.response.comment.threads.filter(elem => elem.forkLabel === currentForkType)[0]
            const nicoruKeyResponse: NicoruKeyResponseRootObject = await getNicoruKey(currentThread.id, currentForkType)
            if (nicoruKeyResponse.meta.status !== 200) return
            const body: NicoruPostBodyRootObject = {videoId: props.videoInfo.data.response.video.id, fork: currentForkType, no: commentNo, content: commentBody, nicoruKey: nicoruKeyResponse.data.nicoruKey} 
            const response: NicoruPostResponseRootObject = await postNicoru(currentThread.id, JSON.stringify(body))
            console.log(response)
            if (response.meta.status === 201) {
                reloadCommentData()
            }
        }

    }
    //console.log(scrollPosList)

    return <div className="commentlist-container" id="pmw-commentlist">
        <div className="commentlist-title-container">
            <div className="global-flex">
                <div className="global-flex1 global-bold">
                    コメントリスト
                </div>
                <div>
                    <select onChange={(e) => {setCurrentForkType(e.currentTarget.value)}} value={currentForkType}>
                        {commentContent.threads.map((elem, index) => {
                            return <option key={`${index}-${elem.fork}`} value={elem.fork}>{elem.fork}</option>
                        })}
                    </select>
                    <label>
                        <input
                            type="checkbox"
                            className="commentlist-autoscroll"
                            onChange={(e) => {setAutoScroll(e.currentTarget.checked)}}
                            checked={autoScroll}
                        />
                        自動スクロール</label>
                </div>
            </div>
        </div>
        <div className="commentlist-list-container" ref={commentListContainerRef} onMouseEnter={() => setIsCommentListHovered(true)} onMouseLeave={() => setIsCommentListHovered(false)}>
            {sortedComments.map((elem, index) => {
                //console.log(elem)
                return <div key={`${index}-${elem.id}`} ref={commentRefs.current[index]} className="commentlist-list-item">
                    <button onClick={() => onNicoru(elem.no, elem.body, elem.nicoruId)} className="commentlist-list-item-nicorubutton">ﾆｺ{elem.nicoruId && "ｯﾀ"} {elem.nicoruCount}</button>
                    <div className="commentlist-list-item-body">{elem.body}</div>
                    <div className="commentlist-list-item-vpos">{secondsToTime(Math.floor( elem.vposMs / 1000 ))}</div>
                </div>
            })}
        </div>
    </div>
}


export default CommentList;
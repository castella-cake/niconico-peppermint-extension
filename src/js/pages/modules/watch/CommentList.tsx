import { useState, useRef, createRef, RefObject } from "react";
//import { useLang } from "../localizeHook";
import { useInterval } from "../commonHooks";
import { secondsToTime } from "./commonFunction";
import type { CommentDataRootObject, Thread } from "./types/CommentData";
import { VideoDataRootObject } from "./types/VideoData";

type scrollPos = {
    [vposSec: string]: RefObject<HTMLDivElement>

}

// 選択した名前のスレッドを返す関数
function returnSelectedThread(threads: Thread[], forkName: string) {
    for (const elem of threads) {
        console.log()
        if ( elem.fork == forkName ) return elem 
    }
    return false
}

function returnFirstScrollPos(scrollPosList: scrollPos) {
    for (const elem in scrollPosList) {
        if (scrollPosList[elem].current) return scrollPosList[elem]
    }
    
}

type Props = {
    videoInfo: VideoDataRootObject,
    commentContent: CommentDataRootObject,
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
        if (!firstScrollPos || !firstScrollPos.current || !scrollPosList[`${currentTime}` as keyof scrollPos]) return

        const elemHeight = firstScrollPos.current.offsetHeight

        const currentTimeRef = scrollPosList[`${currentTime}` as keyof scrollPos].current
        if (!currentTimeRef || !commentListContainerRef.current) return
        // よくわからないけど試行錯誤の末とりあえずそれらしいように見えてるのでヨシ
        const offsetTop = currentTimeRef.offsetTop - elemHeight
        // 要素がある上で、CommentListをはみ出しているスクロールするべき要素であればスクロール
        if ( offsetTop - (commentListContainerRef.current.clientHeight + elemHeight) > 0 ) {
            commentListContainerRef.current.scrollTop = offsetTop - (commentListContainerRef.current.clientHeight + elemHeight)
            //scrollPosList[`${currentTime}`].current.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start'  })
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
    //console.log(scrollPosList)

    return <div className="commentlist-container">
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
                return <div key={`${index}-${elem.id}`} ref={commentRefs.current[index]} className="commentlist-list-item">
                    <div className="commentlist-list-item-body">{elem.body}</div>
                    <div className="commentlist-list-item-vpos">{secondsToTime(Math.floor( elem.vposMs / 1000 ))}</div>
                </div>
            })}
        </div>
    </div>
}


export default CommentList;
import { useEffect, useMemo, useState, useRef, createRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import { useInterval } from "../commonHooks";
import { secondsToTime } from "./commonFunction";

// 選択した名前のスレッドを返す関数
function returnSelectedThread(threads, forkName) {
    for (const elem of threads) {
        console.log()
        if ( elem.fork == forkName ) return elem 
    }
    return false
}

function CommentList(props) {
    const lang = useLang()
    const [ currentForkType, setCurrentForkType ] = useState("main")
    const [ isCommentListHovered, setIsCommentListHovered ] = useState(false)
    const [ autoScroll, setAutoScroll ] = useState(true)
    const commentListContainerRef = useRef(null)
    // 複数のref
    const commentRefs = useRef([])

    // スクロールタイミングを書いたオブジェクト
    const scrollPosList = {}

    useInterval(() => {
        // データが足りない/オートスクロールが有効化されていない/コメントリストにホバーしている ならreturn
        if (!props.videoInfo.data || !props.commentContent.data || !autoScroll || isCommentListHovered) return

        // video要素の時間
        const currentTime = Math.floor(props.videoRef.current.currentTime)
        // とりあえず一番最初の要素の高さを取得
        const elemHeight = scrollPosList[0].current.offsetHeight
        if (!scrollPosList[`${currentTime}`] || !scrollPosList[`${currentTime}`].current) return
        // よくわからないけど試行錯誤の末とりあえずそれらしいように見えてるのでヨシ
        const offsetTop = scrollPosList[`${currentTime}`].current.offsetTop - elemHeight
        // 要素がある上で、CommentListをはみ出しているスクロールするべき要素であればスクロール
        if ( offsetTop - (commentListContainerRef.current.clientHeight + elemHeight) > 0 ) {
            commentListContainerRef.current.scrollTop = offsetTop - (commentListContainerRef.current.clientHeight + elemHeight)
            //scrollPosList[`${currentTime}`].current.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start'  })
        }
    }, 500)
    
    // データが足りなかったら閉店
    if (!props.videoInfo.data || !props.commentContent.data) return <></>

    const videoInfo = props.videoInfo.data.response
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
            {commentContent.threads.map((elem, index) => {
                return <button key={`${index}-${elem.id}`} type="button" onClick={() => {setCurrentForkType(elem.fork)}}>{elem.fork}</button>
            })}
            <label><input type="checkbox" className="commentlist-autoscroll" onChange={(e) => {setAutoScroll(e.currentTarget.checked)}} checked={autoScroll}/> 自動スクロール</label>
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
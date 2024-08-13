import { useEffect, useMemo, useState, useRef, createRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";

// 選択した名前のスレッドを返す関数
function returnSelectedThread(threads, forkName) {
    for (const elem of threads) {
        console.log()
        if ( elem.fork == forkName ) return elem 
    }
    return false
}
function useInterval(callback, ms) {
    // 渡されたコールバックでRef作成
    const callbackRef = useRef(callback)
    // callbackが更新されたりしたらRef更新
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])
    useEffect(() => {
        // 新しい関数でRefの関数を実行
        const tick = () => { callbackRef.current() } 
        const id = setInterval(tick, ms)
        // 終わったらこれも切る
        return () => {
            clearInterval(id);
        };
    }, [])
}

function CommentList(props) {
    const lang = useLang()
    const [ currentForkType, setCurrentForkType ] = useState("main")
    const [ autoScroll, setAutoScroll ] = useState(true)
    const autoScrollRef = useRef(null)
    const commentListContainerRef = useRef(null)
    // 複数のref
    const commentRefs = useRef([])

    // スクロールタイミングを書いたオブジェクト
    const scrollPosList = {}

    useInterval(() => {
        if (!props.videoInfo.data || !props.commentContent.data || !autoScrollRef.current.checked) return
        const currentTime = Math.floor(props.videoRef.current.currentTime)
        const elemHeight = scrollPosList[0].current.offsetHeight
        const offsetTop = scrollPosList[`${currentTime}`].current.offsetTop - elemHeight
        if ( scrollPosList[`${currentTime}`] && scrollPosList[`${currentTime}`].current && offsetTop - (commentListContainerRef.current.clientHeight + elemHeight) > 0 ) {
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
    console.log(scrollPosList)

    return <div className="commentlist-container">
        <div className="commentlist-title-container">
            {commentContent.threads.map(elem => {
                return <button key={elem.id} type="button" onClick={() => {setCurrentForkType(elem.fork)}}>{elem.fork}</button>
            })}
            <label><input type="checkbox" ref={autoScrollRef} className="commentlist-autoscroll" onChange={(e) => {setAutoScroll(e.currentTarget.checked)}} checked={autoScroll}/> 自動スクロール</label>
        </div>
        <div className="commentlist-list-container" ref={commentListContainerRef}>
            {sortedComments.map((elem, index) => {
                return <div key={elem.id} ref={commentRefs.current[index]} className="commentlist-list-item">{elem.body} {Math.floor( elem.vposMs / 1000 )}</div>
            })}
        </div>
    </div>
}


export default CommentList;
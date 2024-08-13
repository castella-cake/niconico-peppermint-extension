
import { useEffect, useState, useRef } from "react";
import {generateActionTrackId, getVideoInfo, getCommentThread} from "../../modules/watchApi";
import { useStorageContext } from "./extensionHook";
import { useLang } from "./localizeHook";
import Player from "./watch/player";
import Info from "./watch/Info";
import Recommend from "./watch/Recommend";
import CommentList from "./watch/CommentList";

function CreateWatchUI() {
    const lang = useLang()

    const { syncStorage, setSyncStorageValue } = useStorageContext()
    const debugAlwaysOnmyouji = syncStorage.debugalwaysonmyouji

    const smId = ( debugAlwaysOnmyouji ? "sm9" : location.pathname.slice(7).replace(/\?.*/, '') )

    const actionTrackId = generateActionTrackId()

    const [ videoInfo, setVideoInfo ] = useState({})
    const [ commentContent, setCommentContent ] = useState({})
    const videoElementRef = useRef(null)

    useEffect(() => {
        async function fetchInfo() {
            const fetchedVideoInfo = await getVideoInfo(smId)
            setVideoInfo(fetchedVideoInfo)
            console.log(videoInfo)

            const commentRequestBody = {
                params: {
                    ...fetchedVideoInfo.data.response.comment.nvComment.params
                },
                threadKey: fetchedVideoInfo.data.response.comment.nvComment.threadKey
            }
            const commentResponse = await getCommentThread(fetchedVideoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
            setCommentContent(commentResponse)
            console.log(commentResponse)
        }
        fetchInfo()
    },[])
    console.log(videoInfo)
    if (videoInfo == {} || commentContent == {}) return <div>ロード中</div>
    return <>
        {(videoInfo.data) && <title>{videoInfo.data.response.video.title}</title>}
        <a href="https://www.nicovideo.jp/video_top">ニコニコ動画へ戻る</a>
        <div className="watch-container">
            <div className="watch-container-left">
                <Player videoId={smId} actionTrackId={actionTrackId} videoInfo={videoInfo} commentContent={commentContent} videoRef={videoElementRef}/>
                <Info videoInfo={videoInfo}/>
            </div>
            <div className="watch-container-right">
                <CommentList videoInfo={videoInfo} commentContent={commentContent} videoRef={videoElementRef}/>
                <Recommend videoInfo={videoInfo} smId={smId}/>
            </div>
        </div>
    </>
}


export default CreateWatchUI;
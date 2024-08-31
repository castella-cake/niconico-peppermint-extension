import { useEffect, useState, useRef, MouseEvent } from "react";
import { generateActionTrackId, getVideoInfo, getCommentThread, putPlaybackPosition } from "../../modules/watchApi";
import { useStorageContext } from "./extensionHook";
//import { useLang } from "./localizeHook";
import Player from "./watch/Player";
import Info from "./watch/Info";
import Recommend from "./watch/Recommend";
import CommentList from "./watch/CommentList";
import type { VideoDataRootObject } from "./watch/types/VideoData";
import type { CommentDataRootObject } from "./watch/types/CommentData";
import Header from "./watch/header";
import BottomInfo from "./watch/BottomInfo";

const watchLayoutType = {
    reimaginedNewWatch: "renew",
    reimaginedOldWatch: "recresc",
    reimaginedMobileWatch: "resp",
    threeColumn: "3col",
}

function CreateWatchUI() {
    //const lang = useLang()

    const { syncStorage, localStorage, isLoaded } = useStorageContext()
    const debugAlwaysOnmyouji: Boolean = syncStorage.debugalwaysonmyouji

    const [smId, setSmId] = useState(debugAlwaysOnmyouji ? "sm9" : location.pathname.slice(7).replace(/\?.*/, ''))

    const [ actionTrackId, setActionTrackId ] = useState("")
    document.dispatchEvent(new CustomEvent("actionTrackIdGenerated", { detail: actionTrackId }))

    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
    const videoElementRef = useRef<HTMLVideoElement | null>(null)
    const [isFullscreenUi, setIsFullscreenUi] = useState(false);

    useEffect(() => {
        const newActionTrackId = generateActionTrackId()
        setActionTrackId(newActionTrackId)
        async function fetchInfo() {
            const fetchedVideoInfo: VideoDataRootObject = await getVideoInfo(smId)
            setVideoInfo(fetchedVideoInfo)
            //console.log(videoInfo)

            if (!fetchedVideoInfo.data) return
            const commentRequestBody = {
                params: {
                    ...fetchedVideoInfo.data.response.comment.nvComment.params
                },
                threadKey: fetchedVideoInfo.data.response.comment.nvComment.threadKey
            }
            const commentResponse: CommentDataRootObject = await getCommentThread(fetchedVideoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
            setCommentContent(commentResponse)
            //console.log(commentResponse)
            document.dispatchEvent(new CustomEvent("pmw_informationReady", { detail: JSON.stringify({videoInfo: fetchedVideoInfo, actionTrackId: newActionTrackId, commentContent: commentResponse}) }))
        }
        fetchInfo()
    }, [smId])

    useEffect(() => {
        const onPopState = () => {
            setSmId(location.pathname.slice(7).replace(/\?.*/, ''))
        }
        window.addEventListener("popstate", onPopState)
        return () => {window.removeEventListener("popstate", onPopState)}
    }, [])


    //console.log(videoInfo)
    if ( !videoInfo || !commentContent || !isLoaded || !syncStorage || actionTrackId === "" ) return <div>ロード中</div>
    const layoutType = syncStorage.pmwlayouttype || watchLayoutType.reimaginedNewWatch
    const playerSize = localStorage.playersettings.playerAreaSize || 1
    

    const playerElem = <Player
        videoId={smId}
        actionTrackId={actionTrackId}
        videoInfo={videoInfo}
        commentContent={commentContent}
        videoRef={videoElementRef}
        isFullscreenUi={isFullscreenUi}
        setIsFullscreenUi={setIsFullscreenUi}
        setCommentContent={setCommentContent}
    />
    const infoElem = <Info videoInfo={videoInfo} videoRef={videoElementRef} />
    const commentListElem = <CommentList videoInfo={videoInfo} commentContent={commentContent} setCommentContent={setCommentContent} videoRef={videoElementRef} />
    const recommendElem = <Recommend videoInfo={videoInfo} smId={smId} />
    const bottomInfoElem = <BottomInfo videoInfo={videoInfo}/>

    const linkClickHandler = (e: MouseEvent<HTMLDivElement>) => {
        if ( e.target instanceof Element ) {
            const nearestAnchor: HTMLAnchorElement | null = e.target.closest("a")
            if ( nearestAnchor && nearestAnchor.href.startsWith("https://www.nicovideo.jp/watch/") && !nearestAnchor.getAttribute("data-seektime") ) {
                e.stopPropagation()
                e.preventDefault()
                if (videoElementRef.current) {
                    const playbackPositionBody = { watchId: smId, seconds: videoElementRef.current.currentTime }
                    putPlaybackPosition(JSON.stringify(playbackPositionBody))
                }
                history.pushState(null, '', nearestAnchor.href)
                setSmId(nearestAnchor.href.replace("https://www.nicovideo.jp/watch/", "").replace(/\?.*/, ''))
            }
        }
    }


    return <div className={isFullscreenUi ? "container fullscreen" : "container"} onClickCapture={(e) => {linkClickHandler(e)}}>
        {(videoInfo.data) && <title>{videoInfo.data.response.video.title}</title>}
        { !isFullscreenUi && <Header videoViewerInfo={videoInfo.data?.response.viewer}/> }
        <div className="watch-container" watch-type={layoutType} id="pmw-container">
            {layoutType === watchLayoutType.reimaginedOldWatch && infoElem}
            <div className="watch-container-left" settings-size={playerSize}>
                {layoutType !== watchLayoutType.threeColumn && playerElem}
                {(layoutType === watchLayoutType.reimaginedNewWatch || layoutType === watchLayoutType.threeColumn) && infoElem}
                {(layoutType === watchLayoutType.reimaginedNewWatch || layoutType === watchLayoutType.reimaginedMobileWatch) && bottomInfoElem}
            </div>
            { layoutType === watchLayoutType.threeColumn && <div className="watch-container-middle">
                {layoutType === watchLayoutType.threeColumn && playerElem}
            </div> }
            <div className="watch-container-right">
                {layoutType === watchLayoutType.reimaginedMobileWatch && infoElem}
                {commentListElem}
                {(layoutType !== watchLayoutType.reimaginedOldWatch && layoutType !== watchLayoutType.threeColumn) && recommendElem}
            </div>
            {(layoutType === watchLayoutType.reimaginedOldWatch || layoutType === watchLayoutType.threeColumn) && recommendElem}
            {(layoutType === watchLayoutType.reimaginedOldWatch || layoutType === watchLayoutType.threeColumn) && bottomInfoElem}
        </div>
    </div>
}


export default CreateWatchUI
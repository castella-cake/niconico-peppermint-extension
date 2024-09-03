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
import Actions from "./watch/Actions";
import Search from "./watch/Search";

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
            if (videoElementRef.current) {
                const playbackPositionBody = { watchId: smId, seconds: videoElementRef.current.currentTime }
                putPlaybackPosition(JSON.stringify(playbackPositionBody))
            }
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
        key="watchui-player"
    />
    const infoElem = <Info videoInfo={videoInfo} videoRef={videoElementRef} key="watchui-info" />
    const rightActionElem = <div className="watch-container-rightaction" key="watchui-rightaction">
        <Actions videoInfo={videoInfo}/>
        <CommentList videoInfo={videoInfo} commentContent={commentContent} setCommentContent={setCommentContent} videoRef={videoElementRef} key="watchui-commentlist" />
    </div>
    const recommendElem = <Recommend smId={smId} key="watchui-recommend" />
    const bottomInfoElem = <BottomInfo videoInfo={videoInfo} key="watchui-bottominfo"/>
    const searchElem = <Search key="watchui-search" />
    
    type layoutInfo = {
        top: false | any[],
        midLeft: any[],
        midCenter: false | any[]
        midRight: any[],
        bottom: false | any[],
    }

    const layoutPresets: {
        [key: string]: layoutInfo
    } = {
        "renew": {
            top: false,
    
            midLeft: [playerElem, infoElem, bottomInfoElem, searchElem],
            midCenter: false,
            midRight: [rightActionElem, recommendElem],
    
            bottom: false
        },
        "recresc": {
            top: [infoElem, searchElem],
    
            midLeft: [playerElem],
            midCenter: false,
            midRight: [rightActionElem],
    
            bottom: [recommendElem, bottomInfoElem]
        },
        "resp": {
            top: false,
    
            midLeft: [playerElem, bottomInfoElem, searchElem],
            midCenter: false,
            midRight: [infoElem, rightActionElem, recommendElem],
    
            bottom: false
        },
        "3col": {
            top: false,
    
            midLeft: [infoElem],
            midCenter: [playerElem],
            midRight: [rightActionElem],
    
            bottom: [recommendElem, bottomInfoElem, searchElem]
        },
    }

    const currentLayout = layoutPresets[layoutType]

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
            <div className="watch-container-top">
                {currentLayout.top !== false && currentLayout.top}
            </div>
            
            <div className="watch-container-left" settings-size={playerSize}>
                {currentLayout.midLeft}
            </div>
            { layoutType === watchLayoutType.threeColumn && <div className="watch-container-middle">
                {currentLayout.midCenter !== false && currentLayout.midCenter}
            </div> }
            <div className="watch-container-right">
                {currentLayout.midRight}
            </div>
            <div className="watch-container-bottom">
                {currentLayout.bottom !== false && currentLayout.bottom}
            </div>
        </div>
    </div>
}


export default CreateWatchUI
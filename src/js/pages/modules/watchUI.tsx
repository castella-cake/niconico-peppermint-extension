import { useEffect, useState, useRef, MouseEvent, ReactNode } from "react";
import { generateActionTrackId, getVideoInfo, getCommentThread, putPlaybackPosition, getPlaylists } from "../../modules/watchApi";
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
import Playlist from "./watch/Playlist";
import { mylistContext, playlistData } from "./watch/types/playlistQuery";
import { PlaylistResponseRootObject } from "./watch/types/playlistData";

const watchLayoutType = {
    reimaginedNewWatch: "renew",
    reimaginedOldWatch: "recresc",
    reimaginedMobileWatch: "resp",
    threeColumn: "3col",
}

type stackerItem = {
    title: string;
    content?: ReactNode;
}

function Stacker({ items }: { items: stackerItem[] }) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    return <div className="stacker-container">
        <div className="stacker-tabbutton-container">
            {items.map((item, index) => {
                return <button key={index} className={`stacker-tabbutton ${activeTabIndex === index ? "stacker-tabbutton-active" : ""}`} onClick={() => setActiveTabIndex(index)}>{item.title}</button>
            })}
        </div>
        <div className="stacker-content">
            { items[activeTabIndex].content }
        </div>
    </div>
}

function CreateWatchUI() {
    //const lang = useLang()
    

    const { syncStorage, localStorage, isLoaded } = useStorageContext()
    const debugAlwaysOnmyouji: Boolean = syncStorage.debugalwaysonmyouji

    const [smId, setSmId] = useState(debugAlwaysOnmyouji ? "sm9" : location.pathname.slice(7).replace(/\?.*/, ''))
    //const [ currentPlaylist, setCurrentPlaylist ] = useState<playlistData>({ type: null })
    const [ fetchedPlaylistData, setFetchedPlaylistData ] = useState<PlaylistResponseRootObject | null>(null)

    function updatePlaylistState(search = location.search) {
        
        const searchParams = new URLSearchParams(search);
        const playlistString = searchParams.get('playlist');
        //console.log(playlistString)

        async function getData(playlistJson: playlistData) {
            //console.log(playlistJson.context.mylistId)

            if ( playlistJson.type === "mylist" && playlistJson.context.mylistId ) {
                // fetchしようとしているマイリストが、すでにフェッチ済みのマイリストと同一ならスキップする
                if (fetchedPlaylistData && fetchedPlaylistData.data && fetchedPlaylistData.data.id === playlistJson.context.mylistId) return

                const context: mylistContext = playlistJson.context
                const response: any = await getPlaylists(context.mylistId)
                //console.log(response);
                setFetchedPlaylistData(response)
            } else {
                setFetchedPlaylistData(null)
            }
        }

        if (playlistString) {
            const decodedPlaylist = atob(playlistString);
            const playlistJson: playlistData = JSON.parse(decodedPlaylist)
            //setCurrentPlaylist(playlistJson)
            getData(playlistJson)
        } else {
            //setCurrentPlaylist({ type: null })
            setFetchedPlaylistData(null)
        }
    }

    const [ actionTrackId, setActionTrackId ] = useState("")

    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
    const videoElementRef = useRef<HTMLVideoElement | null>(null)
    const [isFullscreenUi, setIsFullscreenUi] = useState(false);

    useEffect(() => {
        const newActionTrackId = generateActionTrackId()
        setActionTrackId(newActionTrackId)
        document.dispatchEvent(new CustomEvent("actionTrackIdGenerated", { detail: actionTrackId }))
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
        // 初回レンダリングで今のプレイリスト状態を設定
        updatePlaylistState()

        // 戻るボタンとかが発生した場合
        const onPopState = () => {
            // 移動前にシーク位置を保存
            if (videoElementRef.current) {
                const playbackPositionBody = { watchId: smId, seconds: videoElementRef.current.currentTime }
                putPlaybackPosition(JSON.stringify(playbackPositionBody))
            }
            // watchだったら更新する、watchではない場合はページ移動が起こる
            setSmId(location.pathname.slice(7).replace(/\?.*/, ''))
            // popstateはlocationも更新後なので、プレイリストに対して何も与えなくて良い
            updatePlaylistState()
        }
        window.addEventListener("popstate", onPopState)
        return () => {window.removeEventListener("popstate", onPopState)}
    }, [])

    //console.log(videoInfo)
    if ( !videoInfo || !commentContent || !isLoaded || !syncStorage || actionTrackId === "" ) return <div>ロード中</div>
    const layoutType = syncStorage.pmwlayouttype || watchLayoutType.reimaginedNewWatch
    const playerSize = localStorage.playersettings.playerAreaSize || 1

    const linkClickHandler = (e: MouseEvent<HTMLDivElement>) => {
        if ( e.target instanceof Element ) {
            const nearestAnchor: HTMLAnchorElement | null = e.target.closest("a")
            // data-seektimeがある場合は、mousecaptureな都合上スキップする。
            if ( nearestAnchor && nearestAnchor.href.startsWith("https://www.nicovideo.jp/watch/") && !nearestAnchor.getAttribute("data-seektime") ) {
                // 別の動画リンクであることが確定したら、これ以上イベントが伝播しないようにする
                e.stopPropagation()
                e.preventDefault()

                // 移動前にシーク位置を保存
                if (videoElementRef.current) {
                    const playbackPositionBody = { watchId: smId, seconds: videoElementRef.current.currentTime }
                    putPlaybackPosition(JSON.stringify(playbackPositionBody))
                }

                // historyにpushして移動
                history.pushState(null, '', nearestAnchor.href)
                
                // 動画IDとプレイリスト状態を更新。プレイリスト状態はlocationが未更新のため、
                setSmId(nearestAnchor.href.replace("https://www.nicovideo.jp/watch/", "").replace(/\?.*/, ''))
                updatePlaylistState(new URL(nearestAnchor.href).search)
            }
        }
    }

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
    const commentListElem = <CommentList videoInfo={videoInfo} commentContent={commentContent} setCommentContent={setCommentContent} videoRef={videoElementRef} key="watchui-commentlist" />
    const playListElem = <Playlist playlistData={fetchedPlaylistData} videoInfo={videoInfo} key="watchui-playlist"/>
    const rightActionElem = <div className="watch-container-rightaction" key="watchui-rightaction">
        <Actions videoInfo={videoInfo}/>
        <Stacker items={[{ title: "コメントリスト", content: commentListElem }, { title: "再生リスト", content: playListElem }]}/>
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
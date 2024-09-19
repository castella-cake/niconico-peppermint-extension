import { useEffect, useState, useRef, MouseEvent, ReactNode } from "react";
import { generateActionTrackId, getVideoInfo, getCommentThread, putPlaybackPosition, getMylist, getRecommend, getSeriesInfo } from "../../modules/watchApi";
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
import Playlist, { playlistData, mylistToSimplifiedPlaylist, seriesToSimplifiedPlaylist } from "./watch/Playlist";
import { mylistContext, playlistQueryData } from "./watch/types/playlistQuery";
//import { MylistResponseRootObject } from "./watch/types/mylistData";
import { RecommendDataRootObject } from "./watch/types/RecommendData";
import { SeriesResponseRootObject } from "./watch/types/seriesData";
import { Stats } from "./watch/ShinjukuUI";

const watchLayoutType = {
    reimaginedNewWatch: "renew",
    reimaginedOldWatch: "recresc",
    Stacked: "stacked",
    threeColumn: "3col",
    shinjuku: "shinjuku"
}

type stackerItem = {
    title: string;
    content?: ReactNode;
    disabled?: boolean;
}

function Stacker({ items }: { items: stackerItem[] }) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    return <div className="stacker-wrapper"><div className="stacker-container">
        <div className="stacker-tabbutton-container">
            {items.map((item, index) => {
                if (item.disabled) return null;
                return <button key={index} className={`stacker-tabbutton ${activeTabIndex === index ? "stacker-tabbutton-active" : ""}`} onClick={() => setActiveTabIndex(index)}>{item.title}</button>
            })}
        </div>
        <div className="stacker-content">
            { items[activeTabIndex].content }
        </div>
    </div>
    </div>
}

function CreateWatchUI() {
    //const lang = useLang()
    

    const { syncStorage, localStorage, isLoaded } = useStorageContext()
    const debugAlwaysOnmyouji: Boolean = syncStorage.debugalwaysonmyouji

    const [smId, setSmId] = useState(debugAlwaysOnmyouji ? "sm9" : location.pathname.slice(7).replace(/\?.*/, ''))
    //const [ currentPlaylist, setCurrentPlaylist ] = useState<playlistData>({ type: null })
    //const [ fetchedPlaylistData, setFetchedPlaylistData ] = useState<MylistResponseRootObject | null>(null)
    const [ playlistData, setPlaylistData ] = useState<playlistData>({ type: "none", items: [] })

    function updatePlaylistState(search = location.search) {
        
        const searchParams = new URLSearchParams(search);
        const playlistString = searchParams.get('playlist');
        //console.log(playlistString)

        async function getData(playlistJson: playlistQueryData) {
            //console.log(playlistJson.context.mylistId)

            if ( playlistJson.type === "mylist" && playlistJson.context.mylistId ) {
                // fetchしようとしているマイリストが、すでにフェッチ済みのマイリストと同一ならスキップする
                if (playlistData.id === playlistJson.context.mylistId) return

                const context: mylistContext = playlistJson.context
                const response: any = await getMylist(context.mylistId)
                //console.log(response);
                //setFetchedPlaylistData(response)
                setPlaylistData({ type: "mylist", id: response.data.id.value, items: mylistToSimplifiedPlaylist(response) })
            } else if ( playlistJson.type === "series" && playlistJson.context.seriesId ) {
                const response: SeriesResponseRootObject = await getSeriesInfo(playlistJson.context.seriesId)
                console.log(response)
                setPlaylistData({ type: "series", id: playlistJson.context.seriesId, items: seriesToSimplifiedPlaylist(response)})
            } else {
                //setFetchedPlaylistData(null)
                setPlaylistData({ type: "none", items: [] })
            }
        }

        if (playlistString) {
            const decodedPlaylist = atob(playlistString);
            const playlistJson: playlistQueryData = JSON.parse(decodedPlaylist)
            //setCurrentPlaylist(playlistJson)
            getData(playlistJson)
        } else {
            //setCurrentPlaylist({ type: null })
            //setFetchedPlaylistData(null)
        }
    }

    const [ actionTrackId, setActionTrackId ] = useState("")

    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
    const [ recommendData, setRecommendData ] = useState<RecommendDataRootObject>({})
    const videoElementRef = useRef<HTMLVideoElement | null>(null)
    const [isFullscreenUi, setIsFullscreenUi] = useState(false);
    const isEventFired = useRef<boolean>(false)

    useEffect(() => {
        const newActionTrackId = generateActionTrackId()
        setActionTrackId(newActionTrackId)
        document.dispatchEvent(new CustomEvent("actionTrackIdGenerated", { detail: newActionTrackId }))
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
            
            const recommendResponse = await getRecommend(smId)
            setRecommendData(recommendResponse)
            //console.log(commentResponse)
        }
        fetchInfo()
    }, [smId])

    useEffect(() => {
        if (videoInfo.meta?.status === 200 && commentContent.meta?.status === 200 && actionTrackId !== "" && isEventFired.current !== true) {
            document.dispatchEvent(new CustomEvent("pmw_informationReady", { detail: JSON.stringify({ videoInfo, actionTrackId, commentContent }) }))
            //isEventFired.current = true
        }
    }, [commentContent]) // コメント情報が最後に更新されると踏んで、commentContentだけを依存する

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
            isEventFired.current = false
            setSmId(location.pathname.slice(7).replace(/\?.*/, ''))
            // popstateはlocationも更新後なので、プレイリストに対して何も与えなくて良い
            updatePlaylistState()
        }
        window.addEventListener("popstate", onPopState)
        return () => {window.removeEventListener("popstate", onPopState)}
    }, [])

    //console.log(videoInfo)
    if ( !isLoaded ) return <div>ロード中</div>
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

                changeVideo(nearestAnchor.href)
            }
        }
    }

    function changeVideo(videoUrl: string) {
        // 移動前にシーク位置を保存
        if (videoElementRef.current) {
            const playbackPositionBody = { watchId: smId, seconds: videoElementRef.current.currentTime }
            putPlaybackPosition(JSON.stringify(playbackPositionBody))
        }

        // historyにpushして移動
        history.pushState(null, '', videoUrl)
        isEventFired.current = false
        // 動画IDとプレイリスト状態を更新。プレイリスト状態はlocationが未更新のため、
        setSmId(videoUrl.replace("https://www.nicovideo.jp/watch/", "").replace(/\?.*/, ''))
        updatePlaylistState(new URL(videoUrl).search)
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
        playlistData={playlistData}
        changeVideo={changeVideo}
        recommendData={recommendData}
        key="watchui-player"
    />
    const infoElem = <Info videoInfo={videoInfo} videoRef={videoElementRef} isShinjukuLayout={layoutType === watchLayoutType.shinjuku} key="watchui-info" />
    const commentListElem = <CommentList videoInfo={videoInfo} commentContent={commentContent} setCommentContent={setCommentContent} videoRef={videoElementRef} key="watchui-commentlist" />
    const playListElem = <Playlist playlistData={playlistData} videoInfo={videoInfo} key="watchui-playlist"/>
    const rightActionElem = <div className="watch-container-rightaction" key="watchui-rightaction">
        { layoutType === watchLayoutType.shinjuku ?
            <div className="watch-container-rightaction-hjleft">
                <Stats videoInfo={videoInfo}/>
                <Actions videoInfo={videoInfo}></Actions>
            </div> :
            <Actions videoInfo={videoInfo}></Actions>
        }
        <Stacker items={[{ title: "コメントリスト", content: commentListElem }, { title: "動画概要", content: infoElem, disabled: (layoutType !== watchLayoutType.Stacked)}, { title: "再生リスト", content: playListElem }]}/>
    </div>
    const recommendElem = <Recommend recommendData={recommendData} key="watchui-recommend" />
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
        "stacked": {
            top: false,
    
            midLeft: [playerElem, bottomInfoElem, searchElem],
            midCenter: false,
            midRight: [rightActionElem, recommendElem],
    
            bottom: false
        },
        "3col": {
            top: false,
    
            midLeft: [infoElem],
            midCenter: [playerElem],
            midRight: [rightActionElem],
    
            bottom: [recommendElem, bottomInfoElem, searchElem]
        },
        "shinjuku": {
            top: [searchElem,infoElem],
    
            midLeft: [],
            midCenter: [playerElem, rightActionElem],
            midRight: [],
    
            bottom: [recommendElem, bottomInfoElem]
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
            { currentLayout.midCenter !== false && <div className="watch-container-middle">
                {currentLayout.midCenter}
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
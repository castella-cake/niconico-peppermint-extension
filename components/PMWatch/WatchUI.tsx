import { useEffect, useState, useRef, MouseEvent, ReactNode } from "react";
import { generateActionTrackId, putPlaybackPosition, getMylist, getSeriesInfo } from "../../utils/watchApi";
//import { useLang } from "./localizeHook";
import Player from "./modules/Player";
import Info, { Title } from "./modules/Info";
import Recommend from "./modules/Recommend";
import CommentList from "./modules/CommentList";
import Header from "./modules/Header";
import BottomInfo from "./modules/BottomInfo";
import Actions from "./modules/Actions";
import Search from "./modules/Search";
import Playlist, { playlistData, mylistToSimplifiedPlaylist, seriesToSimplifiedPlaylist } from "./modules/Playlist";
import { mylistContext, playlistQueryData } from "@/types/playlistQuery";
//import { MylistResponseRootObject } from "./watch/types/mylistData";
import { SeriesResponseRootObject } from "@/types/seriesData";
import { NicoHarajukuLogo, Owner, Stats } from "./modules/ShinjukuUI";
import { useRecommendData, useWatchData } from "@/hooks/apiHooks";
import { MintConfig } from "./modules/MintConfig";
import { CSSTransition } from "react-transition-group";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { RecommendItem } from "@/types/RecommendData";
import { arrayMove } from "@dnd-kit/sortable";
import { Card } from "./modules/InfoCards";
import { secondsToTime } from "./modules/commonFunction";
import { VideoActionModal } from "./modules/videoAction/VideoActionModal";
import { useStorageContext } from "@/hooks/extensionHook";

const watchLayoutType = {
    reimaginedNewWatch: "renew",
    reimaginedOldWatch: "recresc",
    Stacked: "stacked",
    threeColumn: "3col",
    shinjuku: "shinjuku",
    gridTest: "gridtest",
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
    const {videoInfo, commentContent, setCommentContent, reloadCommentContent, errorInfo} = useWatchData(smId)
    const recommendData = useRecommendData(smId)
    //const [ currentPlaylist, setCurrentPlaylist ] = useState<playlistData>({ type: null })
    //const [ fetchedPlaylistData, setFetchedPlaylistData ] = useState<MylistResponseRootObject | null>(null)
    const [ playlistData, setPlaylistData ] = useState<playlistData>({ type: "none", items: [] })

    const [ isMintConfigShown, setIsMintConfigShown ] = useState(false)

    const [ videoActionModalState, setVideoActionModalState ] = useState<false | "mylist" | "share">(false)

    const [ actionTrackId, setActionTrackId ] = useState("")

    const videoElementRef = useRef<HTMLVideoElement | null>(null)
    const [isFullscreenUi, setIsFullscreenUi] = useState(false);
    const isEventFired = useRef<boolean>(false)

    const mintConfigElemRef = useRef<HTMLDivElement>(null);
    const videoActionModalElemRef = useRef<HTMLDivElement>(null);

    const [currentDraggingItem, setCurrentDraggingItem] = useState<any | null>(null)

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
                const response: any = await getMylist(context.mylistId, "registeredAt", "desc")
                //console.log(response);
                //setFetchedPlaylistData(response)
                setPlaylistData({ type: "mylist", id: response.data.id.value, items: mylistToSimplifiedPlaylist(response) })
            } else if ( playlistJson.type === "series" && playlistJson.context.seriesId ) {
                const response: SeriesResponseRootObject = await getSeriesInfo(playlistJson.context.seriesId)
                console.log(response)
                setPlaylistData({ type: "series", id: playlistJson.context.seriesId, items: seriesToSimplifiedPlaylist(response)})
            } else if (videoInfo.data) {
                //setFetchedPlaylistData(null)
                setPlaylistData({ type: "none", items: [] })
            }
        }

        if (playlistString && playlistData.type !== "custom") {
            const decodedPlaylist = atob(playlistString.replace("-", "+").replace("_", "/"));
            const playlistJson: playlistQueryData = JSON.parse(decodedPlaylist)
            //setCurrentPlaylist(playlistJson)
            getData(playlistJson)
        }
        if (videoInfo.data && (playlistData.type === "none" || (playlistData.type === "custom" && playlistData.items.length < 2))) {
            const ownerName = videoInfo.data.response.owner && videoInfo.data.response.owner.nickname
            const channelName = videoInfo.data.response.channel && videoInfo.data.response.channel.name
            setPlaylistData({ type: "custom", items: [
                {
                    title: videoInfo.data.response.video.title,
                    id: videoInfo.data.response.video.id,
                    itemId: crypto.randomUUID(),
                    ownerName: ownerName ?? channelName ?? "非公開または退会済みユーザー",
                    duration: videoInfo.data.response.video.duration,
                    thumbnailUrl: videoInfo.data.response.video.thumbnail.middleUrl ?? videoInfo.data.response.video.thumbnail.url
                }
            ] })
        }
    }

    useEffect(() => {
        const newActionTrackId = generateActionTrackId()
        setActionTrackId(newActionTrackId)
        document.dispatchEvent(new CustomEvent("actionTrackIdGenerated", { detail: newActionTrackId }))
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
    }, [videoInfo])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    //console.log(videoInfo)
    if ( !isLoaded ) return <div>ロード中</div>
    const layoutType = syncStorage.pmwlayouttype || watchLayoutType.reimaginedOldWatch
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

    function onModalStateChanged(isModalOpen: boolean, modalType: "mylist" | "share") {
        if (isModalOpen === false) {
            setVideoActionModalState(false)
        } else {
            setVideoActionModalState(modalType)
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
        reloadCommentContent={reloadCommentContent}
        playlistData={playlistData}
        changeVideo={changeVideo}
        recommendData={recommendData}
        key="watchui-player"
    />
    const titleElem = <Title key="watch-container-title" videoInfo={videoInfo} />
    const infoElem = <Info videoInfo={videoInfo} videoRef={videoElementRef} isTitleShown={layoutType !== watchLayoutType.threeColumn} errorInfo={errorInfo} isShinjukuLayout={layoutType === watchLayoutType.shinjuku} key="watchui-info" />
    const commentListElem = <CommentList videoInfo={videoInfo} commentContent={commentContent} setCommentContent={setCommentContent} videoRef={videoElementRef} key="watchui-commentlist" />
    const playListElem = <Playlist playlistData={playlistData} videoInfo={videoInfo} setPlaylistData={setPlaylistData} key="watchui-playlist"/>
    const actionsElem = <Actions onModalOpen={(modalType: "mylist" | "share") => {onModalStateChanged(true, modalType)}} videoInfo={videoInfo} key="watchui-actions"></Actions>
    const rightActionElem = <div className="watch-container-rightaction" key="watchui-rightaction">
        { layoutType === watchLayoutType.shinjuku ?
            <div className="watch-container-rightaction-hjleft">
                <Stats videoInfo={videoInfo}/>
            </div> : actionsElem
        }
        <Stacker items={[{ title: "コメントリスト", content: commentListElem }, { title: "動画概要", content: infoElem, disabled: (layoutType !== watchLayoutType.Stacked)}, { title: "再生リスト", content: playListElem }]}/>
    </div>
    const combinedPlayerElem = <div className="shinjuku-player-container" key="watchui-combinedplayer">
        {playerElem}{rightActionElem}
    </div>
    const recommendElem = <Recommend recommendData={recommendData} key="watchui-recommend" />
    const bottomInfoElem = <BottomInfo videoInfo={videoInfo} key="watchui-bottominfo"/>
    const searchElem = <Search key="watchui-search" />
    const ownerElem = <Owner videoInfo={videoInfo} key="watchui-owner"/>
    const hrjkLogoElem = <div className="hrjk-header"><NicoHarajukuLogo key="watchui-hrjklogo"/>{searchElem}<div className="harajuku-header-migiue-filler">MintWatch</div></div>

    const layoutPresets: {
        [key: string]: JSX.Element[]
    } = {
        "renew": [playerElem, rightActionElem, infoElem, bottomInfoElem, searchElem, recommendElem],
        "recresc": [infoElem, searchElem, playerElem, rightActionElem, recommendElem, bottomInfoElem],
        "stacked": [playerElem, bottomInfoElem, searchElem, rightActionElem, recommendElem],
        "3col": [titleElem, infoElem, playerElem, rightActionElem, recommendElem, bottomInfoElem, searchElem],
        "shinjuku": [hrjkLogoElem, infoElem, ownerElem, actionsElem, combinedPlayerElem, recommendElem, bottomInfoElem],
    }

    const currentLayout = layoutPresets[layoutType]
    function handleDragEnd(e: DragEndEvent) {
        console.log(e)
        setCurrentDraggingItem(null)
        if ( e.over && e.active.id.toString().includes("-recommend") && e.active.data.current ) {
            const data = e.active.data.current as RecommendItem
            if (!data.content || !data.content.title || !data.content.duration || !data.content.id) return
            const thisPlaylistObject = {
                title: data.content.title,
                id: data.content.id.toString(),
                itemId: crypto.randomUUID(),
                ownerName: data.content.owner.name,
                duration: data.content.duration,
                thumbnailUrl: (data.content.thumbnail ? data.content.thumbnail.listingUrl : "")
            }
            setPlaylistData({ ...playlistData, items: [...playlistData.items, thisPlaylistObject], type: "custom" })
        } else if ( e.over && e.active && e.over.id !== e.active.id ) {
            const currentIdList = playlistData.items.map(elem => elem.itemId);
            const oldIndex = currentIdList.indexOf(e.active.id.toString());
            const newIndex = currentIdList.indexOf(e.over.id.toString());
            const sortAfter = arrayMove(playlistData.items, oldIndex, newIndex);
            setPlaylistData({ ...playlistData, items: sortAfter, type: "custom" })
            console.log("sortAfter", sortAfter)
        }
        //setIsDraggingInfoCard(false)
    }
    function handleDragStart(e: DragStartEvent) {
        console.log(e)
        setCurrentDraggingItem(e.active.data.current)
        //setIsDraggingInfoCard(true)
    }

    const thisVideoId = (currentDraggingItem && currentDraggingItem.id) || ( currentDraggingItem && currentDraggingItem.content && currentDraggingItem.content.id ) || null
    const shouldUseCardRecommend = !( layoutType === watchLayoutType.Stacked || layoutType === watchLayoutType.reimaginedNewWatch ) ? "true" : "false"
    const shouldUseHorizontalSearchLayout = !(layoutType === watchLayoutType.shinjuku || layoutType === watchLayoutType.reimaginedOldWatch) ? "true" : "false"
    const shouldUseCardInfo = !( layoutType === watchLayoutType.reimaginedOldWatch || layoutType === watchLayoutType.shinjuku ) ? "true" : "false"
    const shouldUseBigView = localStorage.playersettings.enableBigView ?? false

    return <div className={isFullscreenUi ? "container fullscreen" : "container"} >
        {(videoInfo.data) && <title>{videoInfo.data.response.video.title}</title>}
        { !isFullscreenUi && <Header videoViewerInfo={videoInfo.data?.response.viewer} setIsMintConfigShown={setIsMintConfigShown}/> }
        <CSSTransition nodeRef={mintConfigElemRef} in={isMintConfigShown} timeout={300} unmountOnExit classNames="mintconfig-transition">
            <MintConfig nodeRef={mintConfigElemRef} setIsMintConfigShown={setIsMintConfigShown}/>
        </CSSTransition>
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <div className="watch-container" is-bigview={shouldUseBigView ? "true" : "false"} watch-type={layoutType} settings-size={playerSize} use-card-recommend={shouldUseCardRecommend} use-horizontal-search={shouldUseHorizontalSearchLayout} use-card-info={shouldUseCardInfo} id="pmw-container" onClickCapture={(e) => {linkClickHandler(e)}}>
            <div className="watch-container-grid">
                {currentLayout}
            </div>
            <CSSTransition nodeRef={videoActionModalElemRef} in={videoActionModalState !== false} timeout={300} unmountOnExit classNames="videoaction-modal-transition">
                { videoActionModalState !== false ? <VideoActionModal nodeRef={videoActionModalElemRef} onModalStateChanged={onModalStateChanged} videoInfo={videoInfo} selectedType={videoActionModalState}/> : <></>}
            </CSSTransition>
        </div>
        <DragOverlay>
            { currentDraggingItem && currentDraggingItem.content ? <Card
            thumbnailUrl={currentDraggingItem.content.thumbnail && currentDraggingItem.content.thumbnail.listingUrl}
            thumbText={currentDraggingItem.content.duration ? secondsToTime(currentDraggingItem.content.duration) : "??:??"}
            href={`https://www.nicovideo.jp/watch/${thisVideoId}`}
            title={""}
        /> : null}
        </DragOverlay>
        </DndContext>
    </div>
}


export default CreateWatchUI
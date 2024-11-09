import { useEffect, useState, useRef, RefObject } from "react";
//import { useLang } from "../localizeHook";
import NiconiComments from "@xpadev-net/niconicomments";
import PlayerController from "./PlayerUI/PlayerController";
import VefxController from "./PlayerUI/VefxController";
import { useHlsVideo } from "@/hooks/hlsHooks";
import type { VideoDataRootObject } from "@/types/VideoData";
import type { CommentDataRootObject } from "@/types/CommentData";
import type { Dispatch, ReactNode, SetStateAction } from "react"
import CommentInput from "./PlayerUI/CommentInput";
import Settings from "./PlayerUI/Settings";
import { putPlaybackPosition } from "../../../utils/watchApi";
import { doFilterComment, handleCtrl, sharedNgLevelScore } from "./commonFunction";
import { StatsOverlay } from "./PlayerUI/StatsOverlay";
import { RecommendDataRootObject } from "@/types/RecommendData";
import { playlistData } from "./Playlist";
import { CSSTransition } from "react-transition-group";
import { EndCard } from "./PlayerUI/EndCard";
import { useAudioEffects } from "@/hooks/eqHooks";
import { useStorageContext } from "@/hooks/extensionHook";
import { useInterval } from "@/hooks/commonHooks";
import { PPVScreen } from "./PlayerUI/PPVScreen";

export type effectsState = {
    equalizer: { enabled: boolean, gains: number[] },
    echo: { enabled: boolean, delayTime: number, feedback: number, gain: number },
    preamp: { enabled: boolean, gain: number },
    mono: { enabled: boolean },
}

type Props = {
    videoId: string,
    actionTrackId: string,
    videoInfo: VideoDataRootObject,
    commentContent: CommentDataRootObject,
    videoRef: RefObject<HTMLVideoElement>,
    isFullscreenUi: boolean,
    setIsFullscreenUi: Dispatch<SetStateAction<boolean>>,
    setCommentContent: Dispatch<SetStateAction<CommentDataRootObject>>,
    playlistData: playlistData,
    recommendData: RecommendDataRootObject,
    changeVideo: (videoId: string) => void,
}

type VideoPlayerProps = {
    children?: ReactNode,
    videoRef: RefObject<HTMLVideoElement>,
    onPause: () => void,
    onEnded: () => void,
    canvasRef: RefObject<HTMLCanvasElement>,
    isCommentShown: boolean,
    commentOpacity: number,
    onClick: () => void,
}

function VideoPlayer({children, videoRef, canvasRef, isCommentShown, onPause, onEnded, commentOpacity, onClick}: VideoPlayerProps) {
    return (<div className="player-video-container" >
        <div className="player-video-container-inner">
            <video ref={videoRef} autoPlay onPause={(e) => {onPause()}} onEnded={onEnded} width="1920" height="1080" id="pmw-element-video" onClick={onClick}></video>
            <canvas ref={canvasRef} width="1920" height="1080" style={isCommentShown ? {opacity: commentOpacity} : {opacity: 0}} id="pmw-element-commentcanvas"/>
            { children }
        </div>
    </div>);
}

function Player({ videoId, actionTrackId, videoInfo, commentContent, videoRef, isFullscreenUi, setIsFullscreenUi, setCommentContent, playlistData, changeVideo, recommendData }: Props) {
    //const lang = useLang()
    const { localStorage, setLocalStorageValue, syncStorage } = useStorageContext()

    const [isVefxShown, setIsVefxShown] = useState(false)
    const [isSettingsShown, setIsSettingsShown] = useState(false)
    const [isCommentShown, setIsCommentShown] = useState(true)
    const [isStatsShown, setIsStatsShown] = useState(false)
    const [isCursorStopped, setIsCursorStopped] = useState<boolean>(false)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pipVideoRef = useRef<HTMLVideoElement>(null)
    const commentInputRef = useRef<HTMLInputElement>(null)
    const [frequencies] = useState([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

    const [effectsState, setEffectsState] = useState<effectsState>(localStorage.playersettings.vefxSettings || {
        equalizer: { enabled: false, gains: new Array(frequencies.length).fill(0) },
        echo: { enabled: false, delayTime: 0.25, feedback: 0.5, gain: 1 },
        preamp: { enabled: false, gain: 1 },
        mono: { enabled: false },
    });

    const isLoudnessEnabled = localStorage.playersettings.enableLoudnessData ?? true
    const integratedLoudness = (videoInfo.data?.response.media.domand && videoInfo.data?.response.media.domand?.audios[0].loudnessCollection[0].value) ?? 1
    const loudnessData = isLoudnessEnabled ? integratedLoudness : 1
    const { updateEqualizer, updateEcho, updatePreampGain } = useAudioEffects(videoRef, frequencies, effectsState, loudnessData);

    const handleEffectsChange = (newState: effectsState) => {
        setEffectsState(newState);

        // 各エフェクトの更新処理
        updateEqualizer(newState.equalizer.gains);
        updateEcho(newState.echo.delayTime, newState.echo.feedback, newState.echo.gain);
        updatePreampGain(newState.preamp.gain);
    };

    const userAgent = window.navigator.userAgent.toLowerCase();
    const shouldUseContentScriptHls = !(userAgent.indexOf('chrome') == -1 || syncStorage.pmwforcepagehls)
    const hlsRef = useHlsVideo(videoRef, videoInfo, videoId, actionTrackId, shouldUseContentScriptHls, localStorage.playersettings.preferredLevel || -1)
    const niconicommentsRef = useRef<NiconiComments | null>(null!)

    // for transition
    const vefxElemRef = useRef<HTMLDivElement>(null)
    const settingsElemRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onUnload = () => {
            if ( !videoRef.current ) return
            const playbackPositionBody = { watchId: videoId, seconds: videoRef.current.currentTime }
            putPlaybackPosition(JSON.stringify(playbackPositionBody))
        }
        window.addEventListener("beforeunload", onUnload)
        return () => { window.removeEventListener("beforeunload", onUnload) }
    }, [])

    useEffect(() => {
        if (!videoInfo.data || !videoRef.current || !videoInfo.data.response.player.initialPlayback || localStorage.playersettings.enableResumePlayback === false) return
        videoRef.current.currentTime = videoInfo.data.response.player.initialPlayback?.positionSec
    }, [videoInfo])

    useEffect(() => {
        if (!localStorage || !localStorage.playersettings || !localStorage.playersettings.vefxSettings) return
        setEffectsState(localStorage.playersettings.vefxSettings)
        handleEffectsChange(effectsState)
    }, [])

    useEffect(() => { // とりあえずこれでパフォーマンスが改善したけど、returnするときにnull入れてるのが良いのか、要素非表示をCSSに任せているのが良いのか、captureStreamを一回だけ作ってるのが良いのかはよくわからない
        if (
            canvasRef.current &&
            commentContent.data &&  
            videoRef.current &&
            localStorage.playersettings
        ) {
            if (!commentContent.data) return
            console.log("niconicomments redefined")
            const filteredThreads = doFilterComment(commentContent.data.threads, sharedNgLevelScore[(localStorage.playersettings.sharedNgLevel ?? "mid") as keyof typeof sharedNgLevelScore])
            niconicommentsRef.current = new NiconiComments(canvasRef.current, filteredThreads, { format: "v1", enableLegacyPiP: true, video: (localStorage.playersettings.enableCommentPiP ? videoRef.current : undefined) })
            if (localStorage.playersettings.enableCommentPiP && pipVideoRef.current && !pipVideoRef.current.srcObject) {
                pipVideoRef.current.srcObject = canvasRef.current.captureStream()
            }
            return () => {
                niconicommentsRef.current = null
                if (pipVideoRef.current) pipVideoRef.current.srcObject = null
            }
        }
    }, [commentContent, localStorage.playersettings.enableCommentPiP])
    
    
    useInterval(() => {
        if (!videoRef.current || !isCommentShown || !niconicommentsRef.current) return
        niconicommentsRef.current.drawCanvas(videoRef.current.currentTime * 100)
    }, 8)

    const toggleFullscreen = () => {
        const shouldRequestFullscreen = localStorage.playersettings.requestMonitorFullscreen ?? true
        if (!isFullscreenUi && shouldRequestFullscreen) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreenUi(!isFullscreenUi);
    };

    useEffect(() => {
        let timeout = setTimeout(() => {
            setIsCursorStopped(true)
        }, 2500)
        const handleFullscreenChange = (e: Event) => {
            if ( !document.fullscreenElement ) {
                setIsFullscreenUi(false)
            } else {
                setIsFullscreenUi(true)
            }
        }
        const onKeydown = (e: KeyboardEvent) => handleCtrl(e, videoRef.current, commentInputRef.current, toggleFullscreen)
        const handleMouseMove = (e: MouseEvent) => {
            clearTimeout(timeout)
            if ( isCursorStopped !== true ) setIsCursorStopped(false)
            timeout = setTimeout(() => {
                setIsCursorStopped(true)
            }, 2500)
        }
        document.body.addEventListener("keydown", onKeydown)
        document.body.addEventListener("fullscreenchange", handleFullscreenChange)
        videoRef.current?.addEventListener("mousemove", handleMouseMove)

        pipVideoRef.current?.addEventListener("mousemove", handleMouseMove)
        return () => {
            document.body.removeEventListener("keydown", onKeydown)
            document.body.removeEventListener("fullscreenchange", handleFullscreenChange)
            videoRef.current?.removeEventListener("mousemove", handleMouseMove)
            pipVideoRef.current?.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = localStorage.playersettings.playbackRate || 1.0
    }, [localStorage])

    function playlistIndexControl(add: number) {
        if (playlistData.items.length > 0) {
            const currentVideoIndex = playlistData.items?.findIndex(video => video.id === videoId)
            if (currentVideoIndex === undefined || currentVideoIndex === -1 || currentVideoIndex + add > playlistData.items.length || currentVideoIndex + add < 0) return
            const nextVideo = playlistData.items[currentVideoIndex + add]
            let playlistQuery: { type: string, context: any } = {
                type: playlistData.type,
                context: {}
            }
            if ( playlistData.type === "mylist" ) {
                playlistQuery.context = { mylistId: Number(playlistData.id), sortKey: "addedAt", sortOrder: "asc" }
            } else if ( playlistData.type === "series" ) {
                playlistQuery.context = { seriesId: Number(playlistData.id) }
            }
            changeVideo(`https://www.nicovideo.jp/watch/${encodeURIComponent(nextVideo.id)}?playlist=${btoa(JSON.stringify(playlistQuery))}`)
        } else if (recommendData.data?.items && recommendData.data.items[0].contentType === "video" && add === 1) {
            changeVideo(`https://www.nicovideo.jp/watch/${encodeURIComponent(recommendData.data.items[0].content.id)}`)
        }
    }
    
    function onPause() {
        if ( !videoRef.current ) return
        const playbackPositionBody = { watchId: videoId, seconds: videoRef.current.currentTime }
        putPlaybackPosition(JSON.stringify(playbackPositionBody))
    }

    function onEnded() {
        const autoPlayType = localStorage.playersettings.autoPlayType ?? "playlistonly"
        if ( ((autoPlayType === "playlistonly" && playlistData.items.length > 1) || autoPlayType === "always") && !localStorage.playersettings.isLoop ) {
            playlistIndexControl(1)
        }
    }

    function videoOnClick() {
        const video = videoRef.current
        if ( !video ) return
        if ( video.paused ) {
            video.play()
        } else {
            video.pause()
            onPause()
        }
    }

    return <div className="player-container"
        id="pmw-player"
        is-pipvideo={localStorage.playersettings.enableCommentPiP && isCommentShown ? "true" : "false"}
        is-dynamic-controller={localStorage.playersettings.integratedControl !== "never" ? "true" : "false"}
        is-integrated-controller={localStorage.playersettings.integratedControl === "always" && !isFullscreenUi ? "true" : "false"}
        is-cursor-stopped={isCursorStopped ? "true" : "false"}
    >
        <VideoPlayer videoRef={videoRef} canvasRef={canvasRef} isCommentShown={isCommentShown} onPause={onPause} onEnded={onEnded} commentOpacity={localStorage.playersettings.commentOpacity || 1} onClick={videoOnClick}>
            <video
                ref={pipVideoRef}
                className="player-commentvideo-pip"
                width="1920"
                height="1080"
                autoPlay
                onPause={() => {videoRef.current && videoRef.current.pause()}}
                onPlay={() => {videoRef.current && videoRef.current.play()}}
                onClick={videoOnClick}
            >
            </video>
            <CSSTransition nodeRef={vefxElemRef} in={isVefxShown} timeout={400} unmountOnExit classNames="player-transition-vefx">
                <VefxController
                    nodeRef={vefxElemRef}
                    frequencies={frequencies}
                    effectsState={effectsState}
                    onEffectsChange={(state: effectsState) => {
                        setLocalStorageValue("playersettings", { ...localStorage.playersettings, vefxSettings: state })
                        // 反映して再レンダリング
                        handleEffectsChange(state)
                        setEffectsState(state)
                    }}
                />
            </CSSTransition>
            <CSSTransition nodeRef={settingsElemRef} in={isSettingsShown} timeout={400} unmountOnExit classNames="player-transition-settings">
                <Settings nodeRef={settingsElemRef} isStatsShown={isStatsShown} setIsStatsShown={setIsStatsShown}/>
            </CSSTransition>
            { isStatsShown && <StatsOverlay videoInfo={videoInfo} videoRef={videoRef} hlsRef={hlsRef}/> }
            <EndCard videoInfo={videoInfo} videoRef={videoRef}/>
            <PPVScreen videoInfo={videoInfo}/>
        </VideoPlayer>
        <div className="player-bottom-container">
            <PlayerController
                videoRef={videoRef}
                hlsRef={hlsRef}
                effectsState={effectsState}

                isVefxShown={isVefxShown}
                setIsVefxShown={setIsVefxShown}

                isFullscreenUi={isFullscreenUi}
                toggleFullscreen={toggleFullscreen}

                isCommentShown={isCommentShown}
                setIsCommentShown={setIsCommentShown}

                isSettingsShown={isSettingsShown}
                setIsSettingsShown={setIsSettingsShown}

                commentContent={commentContent}

                playlistIndexControl={playlistIndexControl}
            />
            <CommentInput videoId={videoId} videoRef={videoRef} videoInfo={videoInfo} setCommentContent={setCommentContent} commentInputRef={commentInputRef}/>
        </div>
    </div>
}


export default Player;
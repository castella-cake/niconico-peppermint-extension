import { useEffect, useState, useRef, RefObject } from "react";
import { useStorageContext } from "../extensionHook";
//import { useLang } from "../localizeHook";
import NiconiComments from "@xpadev-net/niconicomments";
import PlayerController from "./PlayerUI/PlayerController";
import { useAudioEffects, } from "../eqHooks";
import VefxController from "./PlayerUI/vefxController";
import { useHlsVideo } from "./watchHooks";
import type { VideoDataRootObject } from "./types/VideoData";
import type { CommentDataRootObject } from "./types/CommentData";
import type { Dispatch, ReactNode, SetStateAction } from "react"
import CommentInput from "./PlayerUI/CommentInput";
import Settings from "./Settings";
import { putPlaybackPosition } from "../../../modules/watchApi";
import { handleCtrl } from "./commonFunction";
import { PlaylistResponseRootObject } from "./types/playlistData";
import { mylistContext } from "./types/playlistQuery";
import { StatsOverlay } from "./PlayerUI/StatsOverlay";
import { RecommendDataRootObject } from "./types/RecommendData";

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
    playlistData: PlaylistResponseRootObject | null,
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
}

function VideoPlayer({children, videoRef, canvasRef, isCommentShown, onPause, onEnded, commentOpacity}: VideoPlayerProps) {
    return (<div className="player-video-container">
        <div className="player-video-container-inner">
            <video ref={videoRef} controls autoPlay onPause={(e) => {onPause()}} onEnded={onEnded} width="1920" height="1080" id="pmw-element-video"></video>
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

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const commentInputRef = useRef<HTMLInputElement>(null)
    const [frequencies] = useState([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

    const [effectsState, setEffectsState] = useState<effectsState>(localStorage.playersettings.vefxSettings || {
        equalizer: { enabled: false, gains: new Array(frequencies.length).fill(0) },
        echo: { enabled: false, delayTime: 0.25, feedback: 0.5, gain: 1 },
        preamp: { enabled: false, gain: 1 },
        mono: { enabled: false },
    });

    const isLoudnessEnabled = localStorage.playersettings.enableLoudnessData ?? true
    const integratedLoudness = videoInfo.data?.response.media.domand.audios[0].loudnessCollection[0].value ?? 1
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
        if (!videoInfo.data || !videoRef.current || !videoInfo.data.response.player.initialPlayback) return
        videoRef.current.currentTime = videoInfo.data.response.player.initialPlayback?.positionSec
    }, [videoInfo])

    useEffect(() => {
        if (!localStorage || !localStorage.playersettings || !localStorage.playersettings.vefxSettings) return
        setEffectsState(localStorage.playersettings.vefxSettings)
        handleEffectsChange(effectsState)
    }, [])

    useEffect(() => {
        if (
            canvasRef.current &&
            commentContent.data &&
            videoRef.current
        ) {
            if (!commentContent.data) return
            const niconiCommentsRenderer = new NiconiComments(canvasRef.current, commentContent.data.threads, { format: "v1" })
            const renderInterval = setInterval(() => {
                if (!videoRef.current) return
                niconiCommentsRenderer.drawCanvas(videoRef.current.currentTime * 100)
            }, 8)
            return () => {
                clearInterval(renderInterval)
            };
        }
    }, [commentContent])

    const toggleFullscreen = () => {
        if (!isFullscreenUi) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreenUi(!isFullscreenUi);
    };

    useEffect(() => {
        const handleFullscreenChange = (e: Event) => {
            if ( !document.fullscreenElement ) {
                setIsFullscreenUi(false)
            } else {
                setIsFullscreenUi(true)
            }
        }
        const onKeydown = (e: KeyboardEvent) => handleCtrl(e, videoRef.current, commentInputRef.current, toggleFullscreen)
        document.body.addEventListener("keydown", onKeydown)
        document.body.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.body.removeEventListener("keydown", onKeydown)
            document.body.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    function playlistIndexControl(add: number) {
        if (playlistData) {
            const currentVideoIndex = playlistData.data.items.findIndex(video => video.content.id === videoId)
            if (currentVideoIndex === -1 || currentVideoIndex + add > playlistData.data.items.length || currentVideoIndex + add < 0) return
            const nextVideo = playlistData.data.items[currentVideoIndex + add]
            const mylistQuery: { type: string, context: mylistContext } = { type: "mylist", context: { mylistId: Number(playlistData && playlistData.data && playlistData.data.id.value), sortKey: "addedAt", sortOrder: "asc" }}
            changeVideo(`https://www.nicovideo.jp/watch/${encodeURIComponent(nextVideo.content.id)}?playlist=${btoa(JSON.stringify(mylistQuery))}`)
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
        if ( localStorage.playersettings.enableAutoPlay ) {
            playlistIndexControl(1)
        }
    }

    return <div className="player-container" id="pmw-player">
        <VideoPlayer videoRef={videoRef} canvasRef={canvasRef} isCommentShown={isCommentShown} onPause={onPause} onEnded={onEnded} commentOpacity={localStorage.playersettings.commentOpacity || 1}>
            {isVefxShown && <VefxController
                frequencies={frequencies}
                effectsState={effectsState}
                onEffectsChange={(state: effectsState) => {
                    setLocalStorageValue("playersettings", { ...localStorage.playersettings, vefxSettings: state })
                    // 反映して再レンダリング
                    handleEffectsChange(state)
                    setEffectsState(state)
                }}
            />}
            { isSettingsShown && <Settings isStatsShown={isStatsShown} setIsStatsShown={setIsStatsShown}/> }
            { isStatsShown && <StatsOverlay videoInfo={videoInfo} videoRef={videoRef} hlsRef={hlsRef}/>}
        </VideoPlayer>
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
}


export default Player;
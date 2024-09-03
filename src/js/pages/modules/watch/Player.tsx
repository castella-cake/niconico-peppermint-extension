import { useEffect, useState, useRef, RefObject } from "react";
import { useStorageContext } from "../extensionHook";
//import { useLang } from "../localizeHook";
import NiconiComments from "@xpadev-net/niconicomments";
import PlayerController from "./PlayerController";
import { useAudioEffects, } from "../eqHooks";
import VefxController from "./vefxController";
import { useHlsVideo } from "./watchHooks";
import type { VideoDataRootObject } from "./types/VideoData";
import type { CommentDataRootObject } from "./types/CommentData";
import type { Dispatch, ReactNode, SetStateAction } from "react"
import CommentInput from "./CommentInput";
import Settings from "./Settings";
import { putPlaybackPosition } from "../../../modules/watchApi";

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
}

type VideoPlayerProps = {
    children?: ReactNode,
    videoRef: RefObject<HTMLVideoElement>,
    setCurrentTime: Dispatch<SetStateAction<number>>,
    setDuration: Dispatch<SetStateAction<number>>,
    onPause: Function
    canvasRef: RefObject<HTMLCanvasElement>,
    isCommentShown: boolean,
    commentOpacity: number,
}

function VideoPlayer({children, videoRef, setCurrentTime, setDuration, canvasRef, isCommentShown, onPause, commentOpacity}: VideoPlayerProps) {
    return (<div className="player-video-container">
        <div className="player-video-container-inner">
            <video ref={videoRef} controls autoPlay onTimeUpdate={e => {
                setCurrentTime(e.currentTarget.currentTime);
            }} onDurationChange={e => {
                setDuration(e.currentTarget.duration);
            }} onPause={(e) => {onPause()}} width="1920" height="1080" id="pmw-element-video"></video>
            <canvas ref={canvasRef} width="1920" height="1080" style={isCommentShown ? {opacity: commentOpacity} : {opacity: 0}} id="pmw-element-commentcanvas"/>
            { children }
        </div>
    </div>);
}


function Player({ videoId, actionTrackId, videoInfo, commentContent, videoRef, isFullscreenUi, setIsFullscreenUi, setCommentContent }: Props) {
    //const lang = useLang()
    const { localStorage, setLocalStorageValue, syncStorage } = useStorageContext()

    const [isVefxShown, setIsVefxShown] = useState(false)
    const [isSettingsShown, setIsSettingsShown] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isCommentShown, setIsCommentShown] = useState(true)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const commentInputRef = useRef<HTMLInputElement>(null)
    const [frequencies] = useState([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

    const [effectsState, setEffectsState] = useState<effectsState>(localStorage.playersettings.vefxSettings || {
        equalizer: { enabled: false, gains: new Array(frequencies.length).fill(0) },
        echo: { enabled: false, delayTime: 0.25, feedback: 0.5, gain: 1 },
        preamp: { enabled: false, gain: 1 },
        mono: { enabled: false },
    });

    const { updateEqualizer, updateEcho, updatePreampGain } = useAudioEffects(videoRef, frequencies, effectsState);

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
    }, [localStorage, localStorage.playersettings])

    useEffect(() => {
        handleEffectsChange(effectsState)
    }, [effectsState])

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
    
    function onPause() {
        if ( !videoRef.current ) return
        const playbackPositionBody = { watchId: videoId, seconds: videoRef.current.currentTime }
        putPlaybackPosition(JSON.stringify(playbackPositionBody))
    }

    return <div className="player-container" id="pmw-player">
        <VideoPlayer videoRef={videoRef} setCurrentTime={setCurrentTime} setDuration={setDuration} canvasRef={canvasRef} isCommentShown={isCommentShown} onPause={onPause} commentOpacity={localStorage.playersettings.commentOpacity || 1}>
            {isVefxShown && <VefxController
                frequencies={frequencies}
                effectsState={effectsState}
                onEffectsChange={(state: effectsState) => {
                    setLocalStorageValue("playersettings", { ...localStorage.playersettings, vefxSettings: state })
                    setEffectsState(state)
                }}
            />}
            { isSettingsShown && <Settings/> }
        </VideoPlayer>
        <PlayerController
            videoRef={videoRef}
            effectsState={effectsState}
            isVefxShown={isVefxShown}
            setIsVefxShown={setIsVefxShown}
            currentTime={currentTime}
            duration={duration}
            isFullscreenUi={isFullscreenUi}
            setIsFullscreenUi={setIsFullscreenUi}
            isCommentShown={isCommentShown}
            setIsCommentShown={setIsCommentShown}
            isSettingsShown={isSettingsShown}
            setIsSettingsShown={setIsSettingsShown}
            hlsRef={hlsRef}
            commentInputRef={commentInputRef}
            commentContent={commentContent}
        />
        <CommentInput videoId={videoId} videoRef={videoRef} videoInfo={videoInfo} setCommentContent={setCommentContent} commentInputRef={commentInputRef}/>
    </div>
}


export default Player;
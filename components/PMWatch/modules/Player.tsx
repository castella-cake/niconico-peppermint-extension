import { useEffect, useState, useRef, RefObject } from "react";
//import { useLang } from "../localizeHook";
import PlayerController from "./PlayerUI/PlayerController";
import VefxController from "./PlayerUI/VefxController";
import { useHlsVideo } from "@/hooks/hlsHooks";
import type { VideoDataRootObject } from "@/types/VideoData";
import { Comment, type CommentDataRootObject } from "@/types/CommentData";
import type { Dispatch, ReactNode, SetStateAction } from "react"
import CommentInput from "./PlayerUI/CommentInput";
import Settings from "./PlayerUI/Settings";
import { putPlaybackPosition } from "../../../utils/watchApi";
import { doFilterThreads, handleCtrl, sharedNgLevelScore } from "./commonFunction";
import { StatsOverlay } from "./PlayerUI/StatsOverlay";
import { RecommendDataRootObject } from "@/types/RecommendData";
import { playlistData } from "./Playlist";
import { CSSTransition } from "react-transition-group";
import { EndCard } from "./PlayerUI/EndCard";
import { useAudioEffects } from "@/hooks/eqHooks";
import { useStorageContext } from "@/hooks/extensionHook";
import { ErrorScreen } from "./PlayerUI/ErrorScreen";
import { CommentRender } from "./PlayerUI/CommentRender";

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
    onClick: () => void,
}

function VideoPlayer({children, videoRef, onPause, onEnded, onClick}: VideoPlayerProps) {
    return (<div className="player-video-container" >
        <div className="player-video-container-inner">
            <video ref={videoRef} autoPlay onPause={(e) => {onPause()}} onEnded={onEnded} width="1920" height="1080" id="pmw-element-video" onClick={onClick}></video>
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
    const cursorStopRef = useRef<boolean>(false) // これはコンテナのルートにも使われるけど、直接書き換えて再レンダリングを抑止する
    const pipVideoRef = useRef<HTMLVideoElement>(null)
    const commentInputRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [frequencies] = useState([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
    const [previewCommentItem, setPreviewCommentItem] = useState<Comment | null>(null)


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

    const shuffleBagRef = useRef<string[]>([])

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

    // for transition
    const vefxElemRef = useRef<HTMLDivElement>(null)
    const settingsElemRef = useRef<HTMLDivElement>(null)

    // レジューム再生の処理
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

    // エフェクト設定をリストア
    useEffect(() => {
        if (!localStorage || !localStorage.playersettings || !localStorage.playersettings.vefxSettings) return
        setEffectsState(localStorage.playersettings.vefxSettings)
        handleEffectsChange(effectsState)
    }, [])

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
        const toCursorStop = () => {
            if (videoRef.current && videoRef.current.currentTime && videoRef.current.duration && videoRef.current?.currentTime >= videoRef.current?.duration) return
            cursorStopRef.current = true
            containerRef.current?.setAttribute("is-cursor-stopped", "true")
        }
        const onTimeUpdate = () => {
            if ( !videoRef.current || !videoRef.current.currentTime || !videoRef.current.duration ) return
            if (videoRef.current?.currentTime >= videoRef.current?.duration) {
                cursorStopRef.current = false
                containerRef.current?.setAttribute("is-cursor-stopped", "false")
                clearTimeout(timeout)
            }
        }
        let timeout = setTimeout(toCursorStop, 2500)
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
            cursorStopRef.current = false
            containerRef.current?.setAttribute("is-cursor-stopped", "false")
            timeout = setTimeout(toCursorStop, 2500)
        }
        document.body.addEventListener("keydown", onKeydown)
        document.body.addEventListener("fullscreenchange", handleFullscreenChange)
        videoRef.current?.addEventListener("mousemove", handleMouseMove)
        videoRef.current?.addEventListener("timeupdate", onTimeUpdate)

        pipVideoRef.current?.addEventListener("mousemove", handleMouseMove)
        return () => {
            clearTimeout(timeout)
            document.body.removeEventListener("keydown", onKeydown)
            document.body.removeEventListener("fullscreenchange", handleFullscreenChange)
            videoRef.current?.removeEventListener("mousemove", handleMouseMove)
            videoRef.current?.removeEventListener("timeupdate", onTimeUpdate)
            pipVideoRef.current?.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = localStorage.playersettings.playbackRate || 1.0
    }, [localStorage])

    const filteredComments = useMemo(() => {
        if (!commentContent.data) return
        return doFilterThreads(commentContent.data.threads, sharedNgLevelScore[(localStorage.playersettings.sharedNgLevel ?? "mid") as keyof typeof sharedNgLevelScore], videoInfo.data?.response.comment.ng.viewer)
    }, [commentContent, videoInfo, localStorage.playersettings.sharedNgLevel])

    function playlistIndexControl(add: number, isShuffle?: boolean) {
        if (playlistData.items.length > 0) {
            let nextVideo = playlistData.items[0]
            if (isShuffle) {
                // 某ブロックゲームと同じく、バックの中から抽選する形式にする
                const shuffleBag = shuffleBagRef.current
                if (shuffleBag.length - 1 >= playlistData.items.length) shuffleBagRef.current = []
                shuffleBagRef.current.push(videoId)
                const bagItems = playlistData.items.filter(item => !shuffleBag.includes(item.id))
                const pickedIndex = Math.floor(Math.random() * (bagItems.length - 1))
                nextVideo = bagItems[pickedIndex]
                console.log(shuffleBag)
                console.log(bagItems)
            } else {
                const currentVideoIndex = playlistData.items?.findIndex(video => video.id === videoId)
                if (currentVideoIndex === undefined || currentVideoIndex === -1 || currentVideoIndex + add > playlistData.items.length || currentVideoIndex + add < 0) return
                nextVideo = playlistData.items[currentVideoIndex + add]
            }
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
            playlistIndexControl(1, localStorage.playersettings.enableShufflePlay)
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
        is-cursor-stopped={cursorStopRef.current ? "true" : "false"}
        ref={containerRef}
    >
        <VideoPlayer videoRef={videoRef} onPause={onPause} onEnded={onEnded} onClick={videoOnClick}>
            { filteredComments && <CommentRender
                videoRef={videoRef}
                pipVideoRef={pipVideoRef}
                isCommentShown={isCommentShown}
                commentOpacity={localStorage.playersettings.commentOpacity || 1}
                threads={filteredComments}
                videoOnClick={videoOnClick}
                enableCommentPiP={localStorage.playersettings.enableCommentPiP}
                previewCommentItem={previewCommentItem}
                defaultPostTargetIndex={videoInfo.data ? videoInfo.data.response.comment.threads.findIndex(elem => elem.isDefaultPostTarget) : -1}
            /> }
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
            <EndCard videoInfo={videoInfo} videoRef={videoRef} recommendData={recommendData}/>
            <ErrorScreen videoInfo={videoInfo}/>
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
            <CommentInput videoId={videoId} videoRef={videoRef} videoInfo={videoInfo} setCommentContent={setCommentContent} commentInputRef={commentInputRef} setPreviewCommentItem={setPreviewCommentItem}/>
        </div>
    </div>
}


export default Player;
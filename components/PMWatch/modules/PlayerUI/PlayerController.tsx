import { useEffect, useRef, useState } from "react";
import { IconAdjustments, IconAdjustmentsCheck, IconAdjustmentsFilled, IconLayoutSidebarRightCollapseFilled, IconLayoutSidebarRightExpand, IconMaximize, IconMessage2, IconMessage2Off, IconMinimize, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBack, IconPlayerSkipBackFilled, IconPlayerSkipForward, IconPlayerSkipForwardFilled, IconRepeat, IconRepeatOff, IconRewindBackward10, IconRewindForward10, IconSettings, IconSettingsFilled, IconVolume, IconVolume3 } from "@tabler/icons-react";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import Hls from "hls.js";
import type { effectsState } from "../Player";
import { CommentDataRootObject } from "@/types/CommentData";
import { Seekbar } from "./Seekbar";
import { secondsToTime, timeCalc } from "../commonFunction";
import { useStorageContext } from "@/hooks/extensionHook";
import { CSSTransition } from "react-transition-group";
type Props = {
    videoRef: RefObject<HTMLVideoElement>,
    effectsState: effectsState,
    isVefxShown: boolean,
    setIsVefxShown: Dispatch<SetStateAction<boolean>>,
    isFullscreenUi: boolean,
    toggleFullscreen: () => void,
    isCommentShown: boolean,
    setIsCommentShown: Dispatch<SetStateAction<boolean>>,
    isSettingsShown: boolean,
    setIsSettingsShown: Dispatch<SetStateAction<boolean>>,
    hlsRef: RefObject<Hls>,
    commentContent: CommentDataRootObject,
    playlistIndexControl: (index: number, shuffleEnabled?: boolean) => void,
}

const playerTypes = {
    default: "default",
    officialPlayer: "html5",
    shinjuku: "shinjuku",
}

function PlayerControllerButton({ onClick, title, className, children }: { onClick: any, title: string, className: string, children: ReactNode}) {
    const [isHovered, setIsHovered] = useState(false)
    const spanRef = useRef(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        if ( !buttonRef.current ) return
        buttonRef.current.addEventListener("mouseenter", () => {
            timeout = setTimeout(() => setIsHovered(true), 500)
        })
        buttonRef.current.addEventListener("mouseleave", ()  => {
            if (timeout) clearTimeout(timeout)
            setIsHovered(false)
        })
        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [])
    return <button ref={buttonRef} className={className} onClick={onClick} aria-label={title}>
        {children}
        <CSSTransition nodeRef={spanRef} in={isHovered} timeout={300} unmountOnExit classNames="playercontroller-tooltip-transition">
            <span ref={spanRef} className="playercontroller-tooltip">{title}</span>
        </CSSTransition>
    </button>
}


function PlayerController({
    videoRef, 
    effectsState,
    isVefxShown,
    setIsVefxShown,
    isFullscreenUi,
    toggleFullscreen,
    isCommentShown,
    setIsCommentShown,
    hlsRef,
    isSettingsShown,
    setIsSettingsShown,
    commentContent,
    playlistIndexControl,
}: Props) {
    const { localStorage, setLocalStorageValue, syncStorage, isLoaded } = useStorageContext()
    const localStorageRef = useRef<any>(null)
    localStorageRef.current = localStorage
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorageRef.current.playersettings, [name]: value })
    }

    const [isIconPlay, setIsIconPlay] = useState(false)
    const [isIndexControl, setIsIndexControl] = useState([false, false])

    const [isMuted, setIsMuted] = useState(false)
    const [videoVolume, setVideoVolume] = useState(50)

    const [hlsLevel, setHlsLevel] = useState(0)
    const [bufferedDuration, setBufferedDuration] = useState(0)
    //const [qualityStrings, setQualityStrings] = useState([])

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const seekbarRef = useRef<HTMLDivElement>(null)
    const [isSeeking, setIsSeeking] = useState(false)
    // @ts-ignore
    const [tempSeekDuration, setTempSeekDuration] = useState(0)

    const [isLoop, setIsLoop] = useState(false)

    // 渡されたコールバックでRef作成
    const doSeekRef = useRef(() => {
        if (!videoRef.current) return
        videoRef.current.currentTime = currentTime
        // 元々clientXから再計算してたけど素直に突っ込んだ方が早かった！！！！！！！
    })
    // callbackが更新されたりしたらRef更新
    useEffect(() => {
        doSeekRef.current = () => {
            if (!videoRef.current) return
            videoRef.current.currentTime = currentTime
            // 元々clientXから再計算してたけど素直に突っ込んだ方が早かった！！！！！！！
        }
    }, [currentTime, videoRef])

    useEffect(() => {
        if (!isLoaded) return
        setIsMuted(localStorage.playersettings.isMuted || false)
        setIsLoop(localStorage.playersettings.isLoop || false)
        setVideoVolume(localStorage.playersettings.volume || localStorage.playersettings.volume === 0 ? localStorage.playersettings.volume : 50)
    }, [])
    useEffect(() => {
        const video = videoRef.current
        if ( video ) {
            video.volume = videoVolume / 100
            video.muted = isMuted
            video.loop = isLoop
        }
    }, [isMuted, isLoop, videoVolume])
    useEffect(() => {
        if ( currentTime < 3 ) {
            setIsIndexControl([true, false])
        } else if ( currentTime >= video.duration ) {
            setIsIndexControl([false, true])
        } else {
            setIsIndexControl([false, false])
        }
    },[currentTime])
    useEffect(() => {
        if (!hlsRef.current) return
        hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, (e, data) => {
            if (!hlsRef.current) return
            setHlsLevel(hlsRef.current.currentLevel)
        })
        hlsRef.current.on(Hls.Events.BUFFER_APPENDED, (e, data) => {
            if (videoRef.current?.buffered.length) {
                setBufferedDuration(videoRef.current?.buffered.end(videoRef.current?.buffered.length - 1))
            }
            //setBufferedDuration()
        })
        hlsRef.current.on(Hls.Events.BUFFER_FLUSHED, (e, data) => {
            setBufferedDuration(0)
        })
    }, [hlsRef.current])
    useEffect(() => {
        const setIconToPause = () => setIsIconPlay(false)
        const setIconToPlay = () => setIsIconPlay(true)
        const updateVolumeState = () => {
            if ( videoRef.current!.volume !== videoVolume / 100 ) {
                setVideoVolume(videoRef.current!.volume * 100)
                writePlayerSettings("volume", videoRef.current!.volume * 100)
            }
            if ( videoRef.current!.muted !== isMuted ) {
                setIsMuted(videoRef.current!.muted)
                writePlayerSettings("isMuted", videoRef.current!.muted)
            }
        }
        
        videoRef.current?.addEventListener("play", setIconToPause)
        videoRef.current?.addEventListener("pause", setIconToPlay)

        videoRef.current?.addEventListener("volumechange", updateVolumeState)
        return () => {
            videoRef.current?.removeEventListener("play", setIconToPause)
            videoRef.current?.removeEventListener("pause", setIconToPlay)
            videoRef.current?.removeEventListener("volumechange", updateVolumeState)
        }
    }, [videoRef.current])
    useEffect(() => {
        const updateCurrentTime = () => { if (videoRef.current!.currentTime !== currentTime && !isSeeking) setCurrentTime(videoRef.current!.currentTime) }
        const updateDuration = () => { if (videoRef.current!.duration !== duration ) setDuration(videoRef.current!.duration) }
        document.addEventListener("pointermove", onSeekPointerMove)
        document.addEventListener("pointerup", onSeekPointerUp)
        videoRef.current?.addEventListener("timeupdate", updateCurrentTime)
        videoRef.current?.addEventListener("durationchange", updateDuration)
        return () => {
            document.removeEventListener("pointermove", onSeekPointerMove)
            document.removeEventListener("pointerup", onSeekPointerUp)
            videoRef.current?.removeEventListener("timeupdate", updateCurrentTime)
            videoRef.current?.removeEventListener("durationchange", updateDuration)
        }
    }, [isSeeking])

    if (!isLoaded) return <div>storage待機中...</div>


    if (!videoRef || !videoRef.current) return <div>video待機中…</div>
    const video = videoRef.current

    function toggleStopState() {
        if ( video.paused ) {
            video.play()
        } else {
            video.pause()
        }
        setIsIconPlay(video.paused)
    }


    function onTimeControl(operation: string, time: number) {
        video.currentTime = timeCalc(operation, time, currentTime, duration)
    }

    function setVolume(volume: number, isMuteToggle = false) {
        if (isMuteToggle) { 
            setIsMuted(!isMuted)
            writePlayerSettings("isMuted", !isMuted)
            return
        }
        setVideoVolume(volume)
        writePlayerSettings("volume", volume)
    }

    function tempSeekHandle(clientX: number) {
        const boundingClientRect = seekbarRef.current?.getBoundingClientRect()
        if (!boundingClientRect || !videoRef.current) return
        //console.log((clientX - boundingClientRect.left) / boundingClientRect.width * 100)
        let scale = ((clientX - boundingClientRect.left) / boundingClientRect.width)
        if ( scale > 1 ) scale = 1
        if ( scale < 0 ) scale = 0
        setCurrentTime(duration * ( scale <= 1 ? scale : 1 ))
    }

    function onSkipBack() {
        onTimeControl("set", 0)
        if (isIndexControl[0] === true) playlistIndexControl(-1, localStorage.playersettings.enableShufflePlay)
    }

    function onSkipForward() {
        onTimeControl("set", video.duration)
        if (isIndexControl[1] === true) playlistIndexControl(1, localStorage.playersettings.enableShufflePlay)
    }



    function onSeekPointerMove(e: PointerEvent) {
        if ( !isSeeking ) return
        tempSeekHandle(e.clientX)
        e.preventDefault()
        e.stopPropagation()
    }

    function onSeekPointerUp(e: PointerEvent) {
        if ( !isSeeking ) return
        doSeekRef.current()
        setIsSeeking(false)
        e.preventDefault()
        e.stopPropagation()
    }

    function toggleLoopState() {
        setIsLoop(!isLoop)
    }

    const enabledEffects = Object.keys(effectsState).map(elem => {
        if ( elem && effectsState[elem as keyof effectsState].enabled ) return elem
        return
    }).filter(elem => {if (elem) return true})

    const currentPlayerType = syncStorage.pmwplayertype || playerTypes.default

    const seekbarElem = <Seekbar
        key="control-seekbar"
        currentTime={currentTime}
        duration={duration}
        showTime={currentPlayerType === playerTypes.default}
        tempSeekDuration={tempSeekDuration}
        bufferedDuration={bufferedDuration}
        isSeeking={isSeeking}
        setIsSeeking={setIsSeeking}
        tempSeekHandle={tempSeekHandle}
        seekbarRef={seekbarRef}
        commentContent={commentContent}
    />

    const effectChangeElem =  <PlayerControllerButton key="control-effectchange" className="playercontroller-effectchange" onClick={() => {setIsVefxShown(!isVefxShown)}} title="エフェクト設定">
        { isVefxShown ? <IconAdjustmentsFilled/> :
            (enabledEffects.length > 0) ? <IconAdjustmentsCheck/> : <IconAdjustments/>
        }
    </PlayerControllerButton>
    const toggleMuteElem = <PlayerControllerButton key="control-togglemute" className="playercontroller-togglemute" onClick={() => {setVolume(0, true)}} title={ isMuted ? "ミュート解除" : "ミュート"}>{ ( isMuted || videoVolume <= 0 ) ? <IconVolume3/> : <IconVolume/> }</PlayerControllerButton>
    const volumeElem = <span key="control-volume" className="playercontroller-volume-container" style={{["--width" as string]: `${videoVolume}%`}}>
        <input type="range" className="playercontroller-volume" min="0" max="100" value={videoVolume} disabled={isMuted} aria-label={`音量 ${Math.floor(videoVolume)}%`} onChange={(e) => {setVolume(Math.floor(e.currentTarget.valueAsNumber))}}/>
        <span className="playercontroller-volume-tooltip">{Math.floor(videoVolume)}%</span>
    </span>
    
    const skipBackElem = <PlayerControllerButton key="control-skipback" className="playercontroller-skipback" onClick={() => {onSkipBack()}} title="開始地点にシーク">{ isIndexControl[0] ? <IconPlayerSkipBackFilled/> : <IconPlayerSkipBack/>}</PlayerControllerButton>
    const skipForwardElem = <PlayerControllerButton key="control-skipforward" className="playercontroller-skipforward" onClick={() => {onSkipForward()}} title="終了地点にシーク">{ isIndexControl[1] ? <IconPlayerSkipForwardFilled/> : <IconPlayerSkipForward/>}</PlayerControllerButton>
    
    const backwardElem = <PlayerControllerButton key="control-backward10s" className="playercontroller-backward10s" onClick={() => {onTimeControl("add", -10)}} title="-10秒シーク"><IconRewindBackward10/></PlayerControllerButton>
    const forwardElem = <PlayerControllerButton key="control-forward10s" className="playercontroller-forward10s" onClick={() => {onTimeControl("add", 10)}} title="10秒シーク"><IconRewindForward10/></PlayerControllerButton>
    
    const togglePauseElem = <PlayerControllerButton key="control-togglepause" className="playercontroller-togglepause" onClick={() => {toggleStopState()}} title={ isIconPlay ? "再生" : "一時停止" }>{ isIconPlay ? <IconPlayerPlayFilled/> : <IconPlayerPauseFilled/> }</PlayerControllerButton>

    const toggleLoopElem = <PlayerControllerButton key="control-toggleloop"className="playercontroller-toggleloop" onClick={() => {toggleLoopState()}} title={ isLoop ? "ループ再生を解除" : "ループ再生を有効化" }>{ isLoop ? <IconRepeat/> : <IconRepeatOff/> }</PlayerControllerButton>

    const timeElem = <div key="control-time" className="playercontroller-time">{secondsToTime( currentTime )}/{secondsToTime(duration)}</div>

    const controlLayouts: { [key: string]: {top: JSX.Element[], left: JSX.Element[], center: JSX.Element[], right: JSX.Element[]} } = {
        "default": {
            top: [ seekbarElem ],
            left: [ effectChangeElem, toggleMuteElem, volumeElem, toggleLoopElem ],
            center: [ skipBackElem, backwardElem, togglePauseElem, forwardElem, skipForwardElem ],
            right: [],
        },
        "html5": {
            top: [ seekbarElem ],
            left: [ togglePauseElem, effectChangeElem, toggleMuteElem, volumeElem ],
            center: [ skipBackElem, backwardElem, timeElem, forwardElem, skipForwardElem ],
            right: [ toggleLoopElem ],
        },
        "shinjuku": {
            top: [],
            left: [ togglePauseElem, skipBackElem, seekbarElem, timeElem ],
            center: [],
            right: [ effectChangeElem, toggleMuteElem, volumeElem, toggleLoopElem ],
        },
    }

    return <div className={`playercontroller-container`} id="pmw-playercontroller"
        player-type={currentPlayerType}
    >
        {controlLayouts[currentPlayerType].top}
        <div className="playercontroller-container-middle">
            <div className="playercontroller-container-left">
                {controlLayouts[currentPlayerType].left}
            </div>
            <div className="playercontroller-container-center">
                {controlLayouts[currentPlayerType].center}
            </div>
            <div className="playercontroller-container-right">
                {controlLayouts[currentPlayerType].right}
                {hlsRef.current && <select onChange={(e) => {
                    if (!hlsRef.current) return
                    hlsRef.current.currentLevel = Number(e.currentTarget.value)
                    writePlayerSettings("preferredLevel", Number(e.currentTarget.value))
                    //setHlsLevel(Number(e.currentTarget.value))
                }} value={hlsLevel} className="playercontroller-qualityselect">
                    {hlsRef.current.levels.map((elem, index) => {
                        return <option value={index} key={index}>{`${elem.height}p`}</option>
                    })}
                    <option value={-1}>Auto</option>
                </select>}
                {/*<div className="playercontroller-qualitydisplay">{hlsRef.current && hlsRef.current.levels.map(elem => `${elem.height}p`)[hlsRef.current.currentLevel]}</div>*/}
                <PlayerControllerButton className="playercontroller-commenttoggle" onClick={() => {setIsCommentShown(!isCommentShown)}} title={isCommentShown ? "コメントを非表示" : "コメントを表示"}>{ isCommentShown ? <IconMessage2/> : <IconMessage2Off/>}</PlayerControllerButton>
                <PlayerControllerButton className="playercontroller-fullscreen" onClick={toggleFullscreen} title={isFullscreenUi ? "フルスクリーンを終了" : "フルスクリーン"}>{ isFullscreenUi ? <IconMinimize/> : <IconMaximize/>}</PlayerControllerButton>
                <PlayerControllerButton className="playercontroller-settings" onClick={() => {setIsSettingsShown(!isSettingsShown)}} title="プレイヤーの設定">{ isSettingsShown ? <IconSettingsFilled/> : <IconSettings/>}</PlayerControllerButton>
                {isFullscreenUi && <PlayerControllerButton className="playercontroller-expandsidebar" onClick={() => {writePlayerSettings("enableBigView", !(localStorage.playersettings.enableBigView ?? false))}} title="サイドバーを展開">{ (localStorage.playersettings.enableBigView ?? false) ? <IconLayoutSidebarRightCollapseFilled/> : <IconLayoutSidebarRightExpand/> }</PlayerControllerButton>}
            </div>
        </div>
    </div>
}


export default PlayerController;
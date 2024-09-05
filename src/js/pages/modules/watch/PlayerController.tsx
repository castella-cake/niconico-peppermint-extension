import { useEffect, useMemo, useRef, useState } from "react";
import { useStorageContext } from "../extensionHook";
import { IconAdjustments, IconAdjustmentsCheck, IconAdjustmentsFilled, IconMaximize, IconMessage2, IconMessage2Off, IconMinimize, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBack, IconPlayerSkipBackFilled, IconPlayerSkipForward, IconPlayerSkipForwardFilled, IconRewindBackward10, IconRewindForward10, IconSettings, IconVolume, IconVolume3 } from "@tabler/icons-react";
import { secondsToTime } from "./commonFunction";
import type { Dispatch, RefObject, SetStateAction } from "react";
import Hls from "hls.js";
import type { effectsState } from "./Player";
import { CommentDataRootObject, Comment as CommentItem} from "./types/CommentData";
type Props = {
    videoRef: RefObject<HTMLVideoElement>,
    effectsState: effectsState,
    isVefxShown: boolean,
    setIsVefxShown: Dispatch<SetStateAction<boolean>>,
    currentTime: number,
    duration: number,
    isFullscreenUi: boolean,
    setIsFullscreenUi: Dispatch<SetStateAction<boolean>>,
    isCommentShown: boolean,
    setIsCommentShown: Dispatch<SetStateAction<boolean>>,
    isSettingsShown: boolean,
    setIsSettingsShown: Dispatch<SetStateAction<boolean>>,
    hlsRef: RefObject<Hls>,
    commentInputRef: RefObject<HTMLInputElement>,
    commentContent: CommentDataRootObject,
}

function PlayerController({videoRef, effectsState, isVefxShown, setIsVefxShown, currentTime, duration, isFullscreenUi, setIsFullscreenUi, isCommentShown, setIsCommentShown, hlsRef, isSettingsShown, setIsSettingsShown, commentInputRef, commentContent}: Props) {
    const { localStorage, setLocalStorageValue, isLoaded } = useStorageContext()
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorage.playersettings, [name]: value })
    }

    const [isIconPlay, setIsIconPlay] = useState(false)
    const [isIconFilled, setIsIconFilled] = useState([false, false])

    const [isMuted, setIsMuted] = useState(false)
    const [videoVolume, setVideoVolume] = useState(50)

    const [hlsLevel, setHlsLevel] = useState(0)
    const [bufferedDuration, setBufferedDuration] = useState(0)
    //const [qualityStrings, setQualityStrings] = useState([])

    const seekbarRef = useRef<HTMLDivElement>(null)
    const [isSeeking, setIsSeeking] = useState(false)
    const [tempSeekDuration, setTempSeekDuration] = useState(0)

    useEffect(() => {
        if (!isLoaded) return
        setIsMuted(localStorage.playersettings.isMuted || false)
        setVideoVolume(localStorage.playersettings.volume || localStorage.playersettings.volume === 0 ? localStorage.playersettings.volume : 50)
    }, [localStorage])
    useEffect(() => {
        if ( currentTime < 11 ) {
            setIsIconFilled([true, false])
        } else if ( currentTime >= video.duration ) {
            setIsIconFilled([false, true])
        } else {
            setIsIconFilled([false, false])
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
        const handleFullscreenChange = (e: Event) => {
            if ( !document.fullscreenElement ) {
                setIsFullscreenUi(false)
            } else {
                setIsFullscreenUi(true)
            }
        }
        const handleCtrl = (e: KeyboardEvent) => {
            if ( e.ctrlKey ) return true;
            if ( e.target instanceof Element ) {
                if ( e.target.closest("input, textarea") ) return true;
            }
            if ( e.key === " " || e.key === "　" ) {
                e.preventDefault()
                toggleStopState()
                return false;
            }
            if ( e.key === "ArrowLeft" ) {
                e.preventDefault()
                timeController("add", -10)
                return false;
            }
            if ( e.key === "ArrowRight" ) {
                e.preventDefault()
                timeController("add", 10)
                return false;
            }
            if ( e.key === "c" || e.key === "C" ) {
                if (!commentInputRef.current) return
                // 入力を防ぐために preventDefaultしてからフォーカス(後でreturnしたら間に合わない)
                e.preventDefault()
                commentInputRef.current.focus()
                return false;
            }
            if ( e.key === "f" || e.key === "F" ) {
                toggleFullscreen()
                return false;
            }
        }
        const setIconToPause = () => setIsIconPlay(false)
        const setIconToPlay = () => setIsIconPlay(true)
        document.body.addEventListener("keydown", handleCtrl)
        document.body.addEventListener("fullscreenchange", handleFullscreenChange)
        videoRef.current?.addEventListener("play", setIconToPause)
        videoRef.current?.addEventListener("pause", setIconToPlay)
        return () => {
            document.body.removeEventListener("keydown", handleCtrl)
            document.body.removeEventListener("fullscreenchange", handleFullscreenChange)
            videoRef.current?.removeEventListener("play", setIconToPause)
            videoRef.current?.removeEventListener("pause", setIconToPlay)
        }
    }, [videoRef.current])

    const commentStatsCalc = useMemo(() => {
        const comments = commentContent.data?.threads
            .map(elem => elem.comments)
            .reduce((prev, current) => {
                return prev.concat(current)
            }, [] as CommentItem[])
            .sort((a, b) => a.vposMs - b.vposMs)
        let commentStats: { [key: string]: number } = {}
        if (!comments) return {}
        // 大体要素数が60くらいになるように
        const splitSeconds = duration / 60
        const setMax = 50
        let maxLength = -1

        for (let i = 0; i < (Math.floor(duration) / splitSeconds); i++) {
            // 前の範囲以上、今の範囲内のvposMsでフィルターして数を記録
            const thisLength = comments.filter(elem => elem.vposMs < (i + 1) * (splitSeconds * 1000) && elem.vposMs > i * (splitSeconds * 1000)).length
            commentStats[i * splitSeconds] = thisLength
            // 最高値なら代入
            if ( maxLength < thisLength ) maxLength = thisLength
        }
        // maxLength は setMax の何倍か
        const lengthScale = maxLength / setMax
        // lengthScaleの値で commentStats をスケール
        for (const key in commentStats) {
            commentStats[key] = Math.floor(commentStats[key] / lengthScale)
        }
        return commentStats
    }, [commentContent, duration])
    if (!isLoaded) return <div>storage待機中...</div>


    if (!videoRef || !videoRef.current) return <div>video待機中…</div>
    const video = videoRef.current
    video.volume = videoVolume / 100
    video.muted = isMuted
    function toggleStopState() {
        if ( video.paused ) {
            video.play()
        } else {
            video.pause()
        }
        setIsIconPlay(video.paused)
    }
    function timeController(operation: string, time: number) {
        // 不要かもしれないが、一応合計時間超過/0未満をハンドルする
        if ( operation == "add" && video.currentTime + time < 0 ) {
            // 足した値が0未満
            video.currentTime = 0
            return true
        } else if ( operation == "add" && video.currentTime + time < video.duration ) {
            // 足した値が合計時間を超えない
            video.currentTime += time
            return true
        } else if ( operation == "add" && video.currentTime + time > video.duration ) {
            // 足した値が合計時間を超える
            video.currentTime = video.duration
            return true
        } else if ( operation == "set" && time >= 0 ){
            // 三項演算子 指定された時間が合計時間を超えるなら合計時間に
            video.currentTime = ( time > video.duration ? video.duration : time )
            return true
        } else if ( operation == "set" && time < 0 ){
            // 指定された時間が0
            video.currentTime = 0
            return true
        } else {
            throw new Error("Operation not found")
        }
    }
    function setVolume(volume: number, isMuteToggle = false) {
        if (isMuteToggle) { 
            video.muted = !video.muted
            setIsMuted(video.muted)
            writePlayerSettings("isMuted", video.muted)
            return
        }
        video.volume = volume / 100
        writePlayerSettings("volume", volume)
        setVideoVolume(volume)
    }

    const toggleFullscreen = () => {
        if (!isFullscreenUi) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreenUi(!isFullscreenUi);
    };

    function tempSeekHandle(clientX: number) {
        const boundingClientRect = seekbarRef.current?.getBoundingClientRect()
        if (!boundingClientRect || !videoRef.current) return
        //console.log((clientX - boundingClientRect.left) / boundingClientRect.width * 100)
        setTempSeekDuration(duration * ((clientX - boundingClientRect.left) / boundingClientRect.width))
    }

    function doSeek(clientX?: number) {
        const boundingClientRect = seekbarRef.current?.getBoundingClientRect()
        if (!boundingClientRect || !videoRef.current) return
        //console.log((clientX - boundingClientRect.left) / boundingClientRect.width * 100)
        if ( clientX ) {
            videoRef.current.currentTime = duration * ((clientX - boundingClientRect.left) / boundingClientRect.width)
        } else {
            videoRef.current.currentTime = tempSeekDuration
        }
    }
    const enabledEffects = Object.keys(effectsState).map(elem => {
        if ( elem && effectsState[elem as keyof effectsState].enabled ) return elem
        return
    }).filter(elem => {if (elem) return true})

    return <div className="playercontroller-container" id="pmw-playercontroller"
        onMouseUp={(e) => {if ( isSeeking ) doSeek(e.clientX);setIsSeeking(false);}}
        onMouseMove={(e) => {if ( isSeeking ) tempSeekHandle(e.clientX)}} 
        onMouseLeave={(e) => {if ( isSeeking ) { doSeek() };setIsSeeking(false);}}
    >
        <div className="playercontroller-container-top">
            <div className="playercontroller-time currenttime">{secondsToTime( isSeeking ? tempSeekDuration : currentTime )}</div>
            <div className="seekbar" ref={seekbarRef} onDragOver={(e) => {e.preventDefault()}}
                onMouseDown={(e) => {setIsSeeking(true);tempSeekHandle(e.clientX)}}
            >
                <div className="seekbar-commentstats global-flex">{Object.keys(commentStatsCalc).map((keyname, index) => {
                    return <span key={`${keyname}s-index`} className="global-flex1" style={{["--height" as any]: `${commentStatsCalc[keyname]}px`}}></span>
                })}</div>
                <div className="seekbar-buffered" style={{ width: `${bufferedDuration / duration * 100}%` }}></div>
                <div className="seekbar-played" style={{ width: `${( isSeeking ? tempSeekDuration : currentTime ) / duration * 100}%` }}></div>
            </div>
            <div className="playercontroller-time duration">{secondsToTime(duration)}</div>
        </div>
        <div className="playercontroller-container-middle">
            <div className="playercontroller-container-left">
                <button type="button" className="playercontroller-effectchange" onClick={() => {setIsVefxShown(!isVefxShown)}} title="エフェクト設定">
                    { isVefxShown ? <IconAdjustmentsFilled/> : 
                        (enabledEffects.length > 0) ? <IconAdjustmentsCheck/> : <IconAdjustments/>
                    }
                </button>
                <button type="button" className="playercontroller-togglemute" onClick={() => {setVolume(0, true)}} title={ isMuted ? "ミュート解除" : "ミュート"}>{ ( isMuted || videoVolume <= 0 ) ? <IconVolume3/> : <IconVolume/> }</button>
                <label className="playercontroller-volume-container"><input type="range" className="playercontroller-volume" min="0" max="100" value={videoVolume} disabled={isMuted} onChange={(e) => {setVolume(e.currentTarget.valueAsNumber)}}/><span>{videoVolume}%</span></label>
            </div>
            <div className="playercontroller-container-center">
                <button type="button" className="playercontroller-skipback" onClick={() => {timeController("set", 0)}} title="開始地点にシーク">{ isIconFilled[0] ? <IconPlayerSkipBackFilled/> : <IconPlayerSkipBack/>}</button>
                <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", -10)}} title="-10秒シーク"><IconRewindBackward10/></button>
                <button type="button" className="playercontroller-togglestop" onClick={() => {toggleStopState()}} title={ isIconPlay ? "再生" : "一時停止"}>{ isIconPlay ? <IconPlayerPlayFilled/> : <IconPlayerPauseFilled/> }</button>
                <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", 10)}} title="10秒シーク"><IconRewindForward10/></button>
                <button type="button" className="playercontroller-skipforward" onClick={() => {timeController("set", video.duration)}} title="終了地点にシーク">{ isIconFilled[1] ? <IconPlayerSkipForwardFilled/> : <IconPlayerSkipForward/>}</button>
            </div>
            <div className="playercontroller-container-right">
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
                <button type="button" className="playercontroller-commenttoggle" onClick={() => {setIsCommentShown(!isCommentShown)}} title={isCommentShown ? "コメントを非表示" : "コメントを表示"}>{ isCommentShown ? <IconMessage2/> : <IconMessage2Off/>}</button>
                <button type="button" className="playercontroller-fullscreen" onClick={toggleFullscreen} title={isFullscreenUi ? "フルスクリーンを終了" : "フルスクリーン"}>{ isFullscreenUi ? <IconMinimize/> : <IconMaximize/>}</button>
                <button type="button" className="playercontroller-settings" onClick={() => {setIsSettingsShown(!isSettingsShown)}} title="プレイヤーの設定"><IconSettings/></button>
            </div>
        </div>
    </div>
}


export default PlayerController;
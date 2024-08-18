import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import { IconAdjustments, IconAdjustmentsFilled, IconMaximize, IconMinimize, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBack, IconPlayerSkipBackFilled, IconPlayerSkipForward, IconPlayerSkipForwardFilled, IconRewindBackward10, IconRewindForward10, IconSettings, IconVolume, IconVolume3 } from "@tabler/icons-react";
import { secondsToTime } from "./commonFunction";
import Hls from "hls.js";

function VefxDisplay({ effectsState }) {
    if (!effectsState) return <></>
    const enabledEffects = Object.keys(effectsState).map(elem => {
        if ( effectsState[elem].enabled ) return elem
        return
    }).filter(elem => {if (elem) return true})
    let bgColor = ""
    let textColor = ""
    let text = ""
    if (enabledEffects.length >= 3) {
        text = "MULTIPLE EFFECTS"
        bgColor = "var(--textcolor1)"
        textColor = "var(--bgcolor1)"
    } else if (enabledEffects.length == 2) {
        text = enabledEffects.map(elem => elem.toUpperCase()).join("/")
        bgColor = "var(--textcolor3)"
        textColor = "var(--bgcolor2)"
    } else if ( enabledEffects.length == 1 ) {
        text = enabledEffects[0].toUpperCase()
        bgColor = "var(--textcolor3)"
        textColor = "var(--bgcolor2)"
    } else {
        text = "EFFECT OFF"
        bgColor = "var(--bgcolor1)"
        textColor = "var(--textcolor2)"
    }
    return <div className="playercontroller-effectdisplay" style={{ "--bg": bgColor, "--color": textColor }}>{text}</div>
}

function PlayerController(props) {
    const { localStorage, setLocalStorageValue, isLoaded } = useStorageContext()
    function writePlayerSettings(name, value) {
        setLocalStorageValue("playersettings", { ...localStorage.playersettings, [name]: value })
    }

    const [isIconPlay, setIsIconPlay] = useState(false)
    const [isIconFilled, setIsIconFilled] = useState([false, false])

    const [isMuted, setIsMuted] = useState(false)
    const [videoVolume, setVideoVolume] = useState(50)

    const [hlsLevel, setHlsLevel] = useState(0)
    //const [qualityStrings, setQualityStrings] = useState([])

    useEffect(() => {
        if (!isLoaded) return
        setIsMuted(localStorage.playersettings.isMuted || false)
        setVideoVolume(localStorage.playersettings.volume || 50)
    }, [localStorage])
    useEffect(() => {
        if ( props.currentTime < 11 ) {
            setIsIconFilled([true, false])
        } else if ( props.currentTime >= video.duration ) {
            setIsIconFilled([false, true])
        } else {
            setIsIconFilled([false, false])
        }
    },[props.currentTime])
    useEffect(() => {
        if (!props.hlsRef.current) return
        setHlsLevel(props.hlsRef.current.currentLevel)
        console.log(hlsLevel)
    }, [props.hlsRef])
    if (!isLoaded) return <div>storage待機中...</div>


    if (!props.videoRef || !props.videoRef.current) return <div>video待機中…</div>
    const video = props.videoRef.current
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
    function timeController(operation, time) {
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
    function setVolume(volume, isMuteToggle = false) {
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

    return <div className="playercontroller-container">
        <div className="playercontroller-container-top">
            <div className="playercontroller-time currenttime">{secondsToTime(props.currentTime)}</div>
            <input
                className="playercontroller-seekbar"
                type="range"
                value={Math.floor(props.currentTime)}
                min="0" max={Math.floor(props.duration)}
                onChange={(e) => {
                    props.videoRef.current.currentTime = e.currentTarget.value
                }}
            />
            <div className="playercontroller-time duration">{secondsToTime(props.duration)}</div>
        </div>
        <div className="playercontroller-container-bottom">
            <div className="playercontroller-container-left">
                <button type="button" className="playercontroller-effectchange" onClick={() => {props.setIsVefxShown(!props.isVefxShown)}}>
                    <IconAdjustmentsFilled/>
                    <VefxDisplay effectsState={props.effectsState}/>
                </button>
                <button type="button" className="playercontroller-togglemute" onClick={() => {setVolume(0, true)}}>{ ( isMuted || videoVolume <= 0 ) ? <IconVolume3/> : <IconVolume/> }</button>
                <label><input type="range" className="playercontroller-volume" min="0" max="100" value={videoVolume} disabled={isMuted} onChange={(e) => {setVolume(e.currentTarget.value)}}/>{videoVolume}%</label>
            </div>
            <div className="playercontroller-container-center">
                <button type="button" className="playercontroller-skipback" onClick={() => {timeController("set", 0)}}>{ isIconFilled[0] ? <IconPlayerSkipBackFilled/> : <IconPlayerSkipBack/>}</button>
                <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", -10)}}><IconRewindBackward10/></button>
                <button type="button" className="playercontroller-togglestop" onClick={() => {toggleStopState()}}>{ isIconPlay ? <IconPlayerPlayFilled/> : <IconPlayerPauseFilled/> }</button>
                <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", 10)}}><IconRewindForward10/></button>
                <button type="button" className="playercontroller-skipforward" onClick={() => {timeController("set", video.duration)}}>{ isIconFilled[1] ? <IconPlayerSkipForwardFilled/> : <IconPlayerSkipForward/>}</button>
            </div>
            <div className="playercontroller-container-right">
                {/*props.hlsRef.current && <select onChange={(e) => {
                    props.hlsRef.current.currentLevel = e.currentTarget.value
                    setHlsLevel(e.currentTarget.value)
                }} value={hlsLevel}>
                    {props.hlsRef.current.levels.map((elem, index) => {
                        return <option value={index} key={index}>{`${elem.width}x${elem.height}`}</option>
                    })}
                </select>*/}
                <div className="playercontroller-qualitydisplay">{props.hlsRef.current && props.hlsRef.current.levels.map(elem => `${elem.height}p`)[props.hlsRef.current.currentLevel]}</div>
                <button type="button" className="playercontroller-fullscreen" onClick={() => {props.setIsFullscreenUi(!props.isFullscreenUi)}}>{ props.isFullscreenUi ? <IconMinimize/> : <IconMaximize/>}</button>
                <button type="button" className="playercontroller-settings" onClick={() => {}}><IconSettings/></button>
            </div>
        </div>
    </div>
}


export default PlayerController;
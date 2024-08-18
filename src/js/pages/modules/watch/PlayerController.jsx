import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import { IconAdjustments, IconAdjustmentsFilled, IconMaximize, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBack, IconPlayerSkipBackFilled, IconPlayerSkipForward, IconPlayerSkipForwardFilled, IconRewindBackward10, IconRewindForward10, IconSettings, IconVolume, IconVolume3 } from "@tabler/icons-react";

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
        bgColor = "var(--textcolor3)"
        textColor = "var(--bgcolor2)"
    } else if (enabledEffects.length == 2) {
        text = enabledEffects.map(elem => elem.toUpperCase()).join("/")
        bgColor = "var(--textcolor2)"
        textColor = "var(--bgcolor2)"
    } else if ( enabledEffects.length == 1 ) {
        text = enabledEffects[0].toUpperCase()
        bgColor = "var(--textcolor2)"
        textColor = "var(--bgcolor2)"
    } else {
        text = "NO EFFECT"
        bgColor = "var(--bgcolor2)"
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
        <div className="playercontroller-container-left">
            <button type="button" className="playercontroller-skipback" onClick={() => {timeController("set", 0)}}>{ isIconFilled[0] ? <IconPlayerSkipBackFilled/> : <IconPlayerSkipBack/>}</button>
            <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", -10)}}><IconRewindBackward10/></button>
            <button type="button" className="playercontroller-togglestop" onClick={() => {toggleStopState()}}>{ isIconPlay ? <IconPlayerPlayFilled/> : <IconPlayerPauseFilled/> }</button>
            <button type="button" className="playercontroller-backward10s" onClick={() => {timeController("add", 10)}}><IconRewindForward10/></button>
            <button type="button" className="playercontroller-skipforward" onClick={() => {timeController("set", video.duration)}}>{ isIconFilled[1] ? <IconPlayerSkipForwardFilled/> : <IconPlayerSkipForward/>}</button>
        </div>
        <div className="playercontroller-container-right">
        <button type="button" className="playercontroller-togglestop" onClick={() => {setVolume(0, true)}}>{ ( isMuted || videoVolume <= 0 ) ? <IconVolume3/> : <IconVolume/> }</button>
            <label><input type="range" className="playercontroller-volume" min="0" max="100" value={videoVolume} disabled={isMuted} onChange={(e) => {setVolume(e.currentTarget.value)}}/>{videoVolume}%</label>
            <button type="button" className="playercontroller-effectchange" onClick={() => {props.setIsVefxShown(!props.isVefxShown)}}><IconAdjustmentsFilled/> <VefxDisplay effectsState={props.effectsState}/></button>
            <button type="button" className="playercontroller-fullscreen" onClick={() => {}}><IconMaximize/></button>
            <button type="button" className="playercontroller-settings" onClick={() => {}}><IconSettings/></button>
        </div>
    </div>
}


export default PlayerController;
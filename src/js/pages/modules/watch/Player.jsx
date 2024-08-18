import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import NiconiComments from "@xpadev-net/niconicomments";
import PlayerController from "./PlayerController";
import { useAudioEffects, } from "../eqHooks";
import VefxController from "./vefxController";
import { useHlsVideo } from "./watchHooks";

function Player(props) {
    const lang = useLang()
    const { localStorage, setLocalStorageValue } = useStorageContext()

    const [isVefxShown, setIsVefxShown] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    const canvasRef = useRef(null)
    const [frequencies] = useState([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

    const [effectsState, setEffectsState] = useState({
        equalizer: { enabled: true, gains: new Array(frequencies.length).fill(0) },
        echo: { enabled: false, delayTime: 0.25, feedback: 0.5, gain: 1 },
        preamp: { enabled: false, gain: 1 },
        mono: { enabled: false },
    });

    const { updateEqualizer, updateEcho, updatePreampGain } = useAudioEffects(props.videoRef, frequencies, effectsState);

    const handleEffectsChange = (newState) => {
        setEffectsState(newState);
        
        // 各エフェクトの更新処理
        updateEqualizer(newState.equalizer.gains);
        updateEcho(newState.echo.delayTime, newState.echo.feedback, newState.echo.gain);
        updatePreampGain(newState.preamp.gain);
    };

    const hlsHook = useHlsVideo(props.videoRef, props.videoInfo, props.videoId, props.actionTrackId)

    useEffect(() => {
        if ( !localStorage || !localStorage.playersettings || !localStorage.playersettings.vefxSettings ) return
        setEffectsState(localStorage.playersettings.vefxSettings)
    }, [localStorage])

    useEffect(() => {
        handleEffectsChange(effectsState)
    }, [effectsState])

    useEffect(() => {
        if (
            canvasRef.current && 
            props.commentContent.data && 
            props.videoRef.current
        ) {
            if ( !props.commentContent.data ) return
            const niconiCommentsRenderer = new NiconiComments(canvasRef.current, props.commentContent.data.threads, { format: "v1" })
            const renderInterval = setInterval(() => {
                niconiCommentsRenderer.drawCanvas(props.videoRef.current.currentTime * 100)
            }, 16)
            return () => {
                clearInterval(renderInterval)
            };
        }
    }, [props.commentContent])

    return <div className="player-container">
        <div className="player-video-container">
            <video ref={props.videoRef} controls autoPlay onTimeUpdate={(e) => {setCurrentTime(e.currentTarget.currentTime)}}/>
            <canvas ref={canvasRef} width="1920" height="1080"/>
        </div>
        <PlayerController videoRef={props.videoRef} effectsState={effectsState} isVefxShown={isVefxShown} setIsVefxShown={setIsVefxShown} currentTime={currentTime}/>
        { isVefxShown && <VefxController
            frequencies={frequencies}
            effectsState={effectsState}
            onEffectsChange={(state) => {
                setLocalStorageValue("playersettings", { ...localStorage.playersettings, vefxSettings: state })
                setEffectsState(state)
            }}
        />}
    </div>
}


export default Player;
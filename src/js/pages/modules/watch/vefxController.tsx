//import { useEffect, useMemo, useState, useRef } from "react";
//import { useStorageContext } from "../extensionHook";
//import { useLang } from "../localizeHook";

import { effectsState } from "./Player";

function VefxController({ frequencies, effectsState, onEffectsChange }: {frequencies: number[], effectsState: effectsState, onEffectsChange: any}) {
    //const lang = useLang()
    //const { syncStorage, setSyncStorageValue } = useStorageContext()
    const handleGainChange = (index: number, value: number) => {
        const newGains = [...effectsState.equalizer.gains];
        newGains[index] = value;
        onEffectsChange({
            ...effectsState,
            equalizer: { ...effectsState.equalizer, gains: newGains },
        });
    };

    const handleEchoDelayChange = (value: number) => {
        onEffectsChange({
            ...effectsState,
            echo: { ...effectsState.echo, delayTime: value },
        });
    };

    const handleEchoFeedbackChange = (value: number) => {
        onEffectsChange({
            ...effectsState,
            echo: { ...effectsState.echo, feedback: value },
        });
    };
    const handleEchoGainChange = (value: number) => {
        onEffectsChange({
            ...effectsState,
            echo: { ...effectsState.echo, gain: value },
        });
    };

    const handlePreampGainChange = (value: number) => {
        onEffectsChange({
            ...effectsState,
            preamp: { ...effectsState.preamp, gain: value },
        });
    };

    const handleEnabledEffect = (effectName: string) => {
        onEffectsChange({
            ...effectsState,
            [effectName]: { ...effectsState[effectName as keyof effectsState], enabled: !effectsState[effectName as keyof effectsState].enabled },
        });
    };

    return <div className="vefx-container">
        <div className="vefx-container-inner">
            <div className="vefx-title">Effect control</div>
            <label>
                <input
                    type="checkbox"
                    checked={effectsState.equalizer.enabled}
                    onChange={(e) => handleEnabledEffect("equalizer")}
                />
                Enable Equalizer
            </label>
            {effectsState.equalizer.enabled &&
                frequencies.map((freq, i) => (
                    <div key={freq} className="vefx-slidercontainer">
                        <label>{freq.toString().replace("000", "K")}</label>
                        <input
                            type="range"
                            min="-15"
                            max="15"
                            step="1"
                            value={effectsState.equalizer.gains[i]}
                            onChange={(e) => handleGainChange(i, parseFloat(e.target.value))}
                            list="eq-list"
                        />
                    </div>
                ))
            }
            <datalist id="eq-list">
                {[-15,-10,-5,0,5,10,15].map(elem => {return <option key={`eq-list-${elem}`}>{elem}</option>})}
            </datalist>

            <label>
                <input
                    type="checkbox"
                    checked={effectsState.echo.enabled}
                    onChange={(e) => handleEnabledEffect("echo")}
                />
                Enable Echo
            </label>
            {effectsState.echo.enabled && (
                <>
                    <div className="vefx-slidercontainer">
                        <label>Delay Time</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={effectsState.echo.delayTime}
                            list="gain-list"
                            onChange={(e) => handleEchoDelayChange(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="vefx-slidercontainer">
                        <label>Feedback</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={effectsState.echo.feedback}
                            list="gain-list"
                            onChange={(e) => handleEchoFeedbackChange(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="vefx-slidercontainer">
                        <label>Gain</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={effectsState.echo.gain}
                            list="gain-list"
                            onChange={(e) => handleEchoGainChange(parseFloat(e.target.value))}
                        />
                    </div>
                    <datalist id="gain-list">
                        {[-1,-0.75,-0.5,-0.25,0,0.25,0.5,0.75,1].map(elem => {return <option key={`gain-list-${elem}`}>{elem}</option>})}
                    </datalist>
                </>
            )}

            <label>
                <input
                    type="checkbox"
                    checked={effectsState.preamp.enabled}
                    onChange={(e) => handleEnabledEffect("preamp")}
                />
                Enable Preamp
            </label>
            {effectsState.preamp.enabled && (
                <div className="vefx-slidercontainer">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={effectsState.preamp.gain}
                        list="preamp-list"
                        onChange={(e) => handlePreampGainChange(parseFloat(e.target.value))}
                    />
                </div>
            )}
            <datalist id="preamp-list">
                {[-10,-5,0,5,10].map(elem => {return <option key={`preamp-list-${elem}`}>{elem}</option>})}
            </datalist>

            <label>
                <input
                    type="checkbox"
                    checked={effectsState.mono.enabled}
                    onChange={(e) => handleEnabledEffect("mono")}
                />
                Enable Mono
            </label>
        </div>
    </div>
}


export default VefxController;
import { useRef, useEffect, RefObject } from "react";
import { effectsState } from "./watch/Player";

// Thank you ChatGPT
export const useAudioEffects = (videoRef: RefObject<HTMLVideoElement>, frequencies: number[], effectsState: effectsState) => {
    const audioContextRef = useRef<any>(null);
    const mediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const biquadFiltersRef = useRef<BiquadFilterNode[]>([]);
    const echoDelayNodeRef = useRef<DelayNode | null>(null);
    const echoFeedbackNodeRef = useRef<GainNode | null>(null);
    const echoGainNodeRef = useRef<GainNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const mergerNodeRef = useRef<ChannelMergerNode | null>(null);

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext)();
        }

        if (videoRef.current && !mediaElementSourceRef.current) {
            mediaElementSourceRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);

            // イコライザーの設定
            biquadFiltersRef.current = frequencies.map((freq) => {
                const filter = audioContextRef.current.createBiquadFilter();
                filter.type = "peaking";
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = effectsState.equalizer.enabled
                    ? effectsState.equalizer.gains[frequencies.indexOf(freq)]
                    : 0;
                return filter;
            });

            // エコーの設定
            echoDelayNodeRef.current = audioContextRef.current.createDelay();
            if (echoDelayNodeRef.current) echoDelayNodeRef.current.delayTime.value = effectsState.echo.delayTime || 0.5;

            echoFeedbackNodeRef.current = audioContextRef.current.createGain();
            if (echoFeedbackNodeRef.current) echoFeedbackNodeRef.current.gain.value = effectsState.echo.feedback || 0.5;

            echoGainNodeRef.current = audioContextRef.current.createGain();
            if (echoGainNodeRef.current) echoGainNodeRef.current.gain.value = effectsState.echo.gain || 0.5;

            if (echoDelayNodeRef.current && echoFeedbackNodeRef.current && echoGainNodeRef.current) {
                echoDelayNodeRef.current.connect(echoFeedbackNodeRef.current);
                echoFeedbackNodeRef.current.connect(echoDelayNodeRef.current);
                echoDelayNodeRef.current.connect(echoGainNodeRef.current);
            }

            // プリアンプの設定
            gainNodeRef.current = audioContextRef.current.createGain();
            if (gainNodeRef.current) gainNodeRef.current.gain.value = effectsState.preamp.gain;


            // モノラル化の設定
            mergerNodeRef.current = audioContextRef.current.createChannelMerger(1);
        }
        if (mediaElementSourceRef.current) {
            let lastNode: any = mediaElementSourceRef.current;
            // 一旦繋がるノードを切断してから接続するようにした
            // 全disconnect
            lastNode.disconnect();
            audioContextRef.current.destination.disconnect();
            
            // effect
            if ( gainNodeRef.current ) gainNodeRef.current.disconnect()
            if ( mergerNodeRef.current ) mergerNodeRef.current.disconnect()
            if (echoGainNodeRef.current) echoGainNodeRef.current.disconnect();
            
            // eq
            biquadFiltersRef.current.forEach((filter) => {
                filter.disconnect();
            });
            
            // ノードを順次接続
            biquadFiltersRef.current.forEach((filter) => {
                if (effectsState.equalizer.enabled) {
                    lastNode.connect(filter);
                    lastNode = filter;
                }
            });
            
            if (echoDelayNodeRef.current && effectsState.echo.enabled) {
                lastNode.connect(echoDelayNodeRef.current);
                lastNode = echoGainNodeRef.current;
            }
            
            if (gainNodeRef.current && effectsState.preamp.enabled) {
                lastNode.connect(gainNodeRef.current);
                lastNode = gainNodeRef.current;
            }
            
            if (mergerNodeRef.current && effectsState.mono.enabled) {
                lastNode.connect(mergerNodeRef.current);
                lastNode = mergerNodeRef.current;
            }
            
            lastNode.connect(audioContextRef.current.destination);
        }
    }, [frequencies, effectsState]);

    // イコライザーのゲイン更新
    const updateEqualizer = (gains: number[]) => {
        biquadFiltersRef.current.forEach((filter, i) => {
            filter.gain.value = gains[i];
        });
    };

    // エコーの設定更新
    const updateEcho = (time: number, feedback: number, gain: number) => {
        if (echoDelayNodeRef.current && echoFeedbackNodeRef.current && echoGainNodeRef.current) {
            /*if (!effectsState.echo.enabled) {
                echoDelayNodeRef.current.delayTime.value = 0;
                echoFeedbackNodeRef.current.gain.value = 0;
                echoGainNodeRef.current.gain.value = 0;
                return
            }*/
            echoDelayNodeRef.current.delayTime.value = time;
            echoFeedbackNodeRef.current.gain.value = feedback;
            echoGainNodeRef.current.gain.value = gain;
        }
    };

    // プリアンプのゲイン更新
    const updatePreampGain = (gain: number) => {
        if (gainNodeRef.current) {
            /*if (!effectsState.preamp.enabled) {
                gainNodeRef.current.gain.value = 0;
                return
            }*/
            gainNodeRef.current.gain.value = gain;
        }
    };

    return {
        updateEqualizer,
        updateEcho,
        updatePreampGain,
    };
};

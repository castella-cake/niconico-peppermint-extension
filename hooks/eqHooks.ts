import { effectsState } from "@/components/PMWatch/modules/Player";
import { useRef, useEffect, RefObject } from "react";

function returnQValue(center: number, next: number | null, prev: number | null) {
    const f0 = center; // 中心周波数

    // 帯域幅を隣接する周波数を使って計算
    let f1 = 0, f2 = 0, bw;
    if ( prev === null && next === null ) return 0

    if (prev === null && next !== null) {
        // 最初の周波数は次の周波数との差を使う
        f1 = f0;
        f2 = (f0 + next) / 2;
    } else if (prev !== null && next === null) {
        // 最後の周波数は前の周波数との差を使う
        f1 = (f0 + prev) / 2;
        f2 = f0;
    } else if (prev !== null && next !== null) {
        // その他は前後の中間点を使う
        f1 = (f0 + prev) / 2;
        f2 = (f0 + next) / 2;
    }
    // 帯域幅を計算
    bw = f2 - f1;

    return f0 / bw
}

// Thank you ChatGPT
export const useAudioEffects = (videoRef: RefObject<HTMLVideoElement>, frequencies: number[], effectsState: effectsState, loudnessControl: number) => {
    const audioContextRef = useRef<AudioContext>(null!);
    const mediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const biquadFiltersRef = useRef<BiquadFilterNode[]>([]);
    const echoDelayNodeRef = useRef<DelayNode | null>(null);
    const echoFeedbackNodeRef = useRef<GainNode | null>(null);
    const echoGainNodeRef = useRef<GainNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const loudnessGainNodeRef = useRef<GainNode | null>(null);
    const mergerSplitterNodeRef = useRef<ChannelSplitterNode | null>(null);
    const mergerGainLeftNodeRef = useRef<GainNode | null>(null);
    const mergerGainRightNodeRef = useRef<GainNode | null>(null);
    const mergerNodeRef = useRef<ChannelMergerNode | null>(null);
    

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext)();
        }

        if (videoRef.current && !mediaElementSourceRef.current) {
            mediaElementSourceRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);

            // イコライザーの設定
            biquadFiltersRef.current = frequencies.map((freq, index) => {
                const filter = audioContextRef.current.createBiquadFilter();

                filter.type = "peaking";
                filter.frequency.value = freq;
                const next = ( index + 1 ) > ( frequencies.length - 1 ) ? null : frequencies[index + 1]
                const prev = ( index - 1 ) < 0 ? null : frequencies[index - 1]
                filter.Q.value = returnQValue(freq, next, prev);
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
            if (gainNodeRef.current) gainNodeRef.current.gain.value = effectsState.preamp.gain

            // ラウドネスコントロール
            loudnessGainNodeRef.current = audioContextRef.current.createGain();
            if (loudnessGainNodeRef.current) loudnessGainNodeRef.current.gain.value = loudnessControl

            // モノラル化の設定
            mergerSplitterNodeRef.current = audioContextRef.current.createChannelSplitter(2);
            mergerGainLeftNodeRef.current = audioContextRef.current.createGain();
            mergerGainRightNodeRef.current = audioContextRef.current.createGain();
            mergerGainLeftNodeRef.current.gain.value = 0.5;
            mergerGainRightNodeRef.current.gain.value = 0.5;
            mergerNodeRef.current = audioContextRef.current.createChannelMerger(1);

            mergerSplitterNodeRef.current.connect(mergerGainLeftNodeRef.current, 0);
            mergerSplitterNodeRef.current.connect(mergerGainRightNodeRef.current, 1);
            mergerGainLeftNodeRef.current.connect(mergerNodeRef.current, 0, 0)
            mergerGainRightNodeRef.current.connect(mergerNodeRef.current, 0, 0)
        }
        if (mediaElementSourceRef.current) {
            let lastNode: any = mediaElementSourceRef.current;
            // 一旦繋がるノードを切断してから接続するようにした
            // 全disconnect
            lastNode.disconnect();
            audioContextRef.current.destination.disconnect();
            
            // effect
            if ( loudnessGainNodeRef.current ) loudnessGainNodeRef.current.disconnect();
            if ( gainNodeRef.current ) gainNodeRef.current.disconnect()
            if ( mergerNodeRef.current ) mergerNodeRef.current.disconnect()
            if (echoGainNodeRef.current) echoGainNodeRef.current.disconnect();
            
            // eq
            biquadFiltersRef.current.forEach((filter) => {
                filter.disconnect();
            });
            
            // ノードを順次接続
            if (loudnessGainNodeRef.current) loudnessGainNodeRef.current.gain.value = loudnessControl
            lastNode.connect(loudnessGainNodeRef.current);
            lastNode = loudnessGainNodeRef.current;

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
                lastNode.connect(mergerSplitterNodeRef.current);
                lastNode = mergerNodeRef.current;
            }
            
            lastNode.connect(audioContextRef.current.destination);
        }
    }, [frequencies, effectsState, loudnessControl]);

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

    const updateLoudnessControl = (gain: number) => {
        if (loudnessGainNodeRef.current) loudnessGainNodeRef.current.gain.value = gain;
    }

    return {
        updateEqualizer,
        updateEcho,
        updatePreampGain,
        updateLoudnessControl
    };
};

import Hls from "hls.js";
import { VideoDataRootObject } from "@/types/VideoData";
import { RefObject, useEffect, useState } from "react";

export function StatsOverlay({ videoInfo, hlsRef, videoRef }: { videoInfo: VideoDataRootObject, hlsRef: RefObject<Hls>, videoRef: RefObject<HTMLVideoElement> }) {
    const [hlsLevel, setHlsLevel] = useState(hlsRef.current?.currentLevel || 0)

    useEffect(() => {
        if (!hlsRef.current) return
        hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, (e, data) => {
            if (!hlsRef.current) return
            setHlsLevel(hlsRef.current.currentLevel)
        })
    }, [hlsRef.current])

    if (!videoInfo.data) return <div className="statsoverlay">動画情報が利用できません</div>
    return <div className="statsoverlay">
        動画ID: {videoInfo.data?.response.video.id}<br/>
        <br/>
        現在のHLS再生クオリティ: { hlsRef.current ?  (hlsLevel === -1 ? <>Lv {hlsLevel} Auto</> : 
            <>
                Lv {hlsLevel} {hlsRef.current?.levels[hlsLevel].width}x{hlsRef.current?.levels[hlsLevel].height} {hlsRef.current?.levels[hlsLevel].frameRate}FPS<br/>
                {hlsRef.current?.levels[hlsLevel].bitrate}bps (max {hlsRef.current?.levels[hlsLevel].maxBitrate} / avg {hlsRef.current?.levels[hlsLevel].averageBitrate})
            </>
        ) : <>内部HLS無効</>}
        <br/>
        <br/>
        取得した動画クオリティ: <br/>
        {videoInfo.data?.response.media.domand.videos.map(elem => {
            return <span key={`videoq-${elem.id}`}>
                {`ID: ${elem.id} - ${elem.width}x${elem.height} (${elem.label} / ${elem.bitRate}bps)`}<br/>
            </span>;
        })}
        <br/>
        取得した音声クオリティ: <br/>
        {videoInfo.data?.response.media.domand.audios.map(elem => {
            return <span key={`audioq-${elem.id}`}>{`ID: ${elem.id} - ${elem.bitRate}bps / ${elem.samplingRate}Hz`}<br/></span>;
        })}
    </div>
}
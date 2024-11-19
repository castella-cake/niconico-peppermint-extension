import { RefObject, useEffect, useState } from "react";
import { VideoDataRootObject } from "@/types/VideoData";
import { getPickupSupporters } from "../../../../utils/watchApi";
import { PickupSupportersRootObject } from "@/types/pickupSupportersData";
import { RecommendDataRootObject } from "@/types/RecommendData";
import { InfoCard } from "../InfoCards";

export function EndCard({ videoInfo, videoRef, recommendData }: { videoInfo: VideoDataRootObject, videoRef: RefObject<HTMLVideoElement>, recommendData: RecommendDataRootObject }) {
    const { localStorage } = useStorageContext()
    const [supportersInfo, setSupportersInfo] = useState<PickupSupportersRootObject | null>(null)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(Infinity)

    const audioElemRef = useRef<HTMLAudioElement>(null)
    useEffect(() => {
        async function getData() {
            if (!videoInfo.data) return
            const response = await getPickupSupporters(videoInfo.data.response.video.id, 10)
            if (response) setSupportersInfo(response)
        }
        getData()
    }, [videoInfo])

    useEffect(() => {
        if (!videoRef.current) return
        const onTimeUpdate = () => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
        }
        const onDurationChange = () => {
            if (videoRef.current) setDuration(videoRef.current.duration)
        }
        videoRef.current.addEventListener("timeupdate", onTimeUpdate)
        videoRef.current.addEventListener("durationchange", onDurationChange)
    }, [videoRef.current])

    useEffect(() => {
        //console.log("vol set:", audioElemRef.current)
        if (!audioElemRef.current) return

        audioElemRef.current.volume = (localStorage.playersettings.volume ?? 50) * 0.01
        audioElemRef.current.muted = localStorage.playersettings.isMuted ?? false
        
    }, [localStorage.playersettings, audioElemRef.current, currentTime])

    if (currentTime < duration) return null

    let ownerName = "非公開または退会済みユーザー"
    if (videoInfo.data && videoInfo.data.response.owner) ownerName = videoInfo.data.response.owner.nickname
    if (videoInfo.data && videoInfo.data.response.channel) ownerName = videoInfo.data.response.channel.name

    return <div className="endcard-container global-flex">
        <div className="endcard-left">
            <div className="endcard-supporters">
            {supportersInfo?.data && supportersInfo?.data.supporters && <span className="endcard-title">提　供</span>}<br/><br/>
            {supportersInfo?.data && supportersInfo?.data.supporters.map((elem,index) => {
                return <span key={`${elem.supporterName}-${elem.userId}-${elem.contribution}`}>
                    {elem.supporterName}<br/>
                </span>
            })}
            </div>
            { supportersInfo?.data && <audio autoPlay src={supportersInfo?.data.voiceUrl} ref={audioElemRef}/> }
        </div>
        <div className="endcard-right">
            <h2>現在の動画</h2>
            {videoInfo.data && <div className="endcard-currentvideo-container">
                <img src={videoInfo.data.response.video.thumbnail.url}></img>
                <div className="endcard-currentvideo-text">
                    <strong>{videoInfo.data.response.video.title}</strong><br/>
                    <span>{ownerName}</span>
                </div>
            </div>}
            <h2>おすすめの動画</h2>
            <div className="endcard-upnext-container">
                {recommendData.data && recommendData.data.items.slice(0,4).map((elem, index) => {
                    return <InfoCard key={`${elem.id}`} obj={elem}/>
                })}
            </div>
        </div>
    </div>
}
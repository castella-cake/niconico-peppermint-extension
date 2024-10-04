import { RefObject, useEffect, useState } from "react";
import { VideoDataRootObject } from "../types/VideoData";
import { getPickupSupporters } from "../../../../modules/watchApi";
import { PickupSupportersRootObject } from "../types/pickupSupportersData";

export function EndCard({ videoInfo, videoRef }: { videoInfo: VideoDataRootObject, videoRef: RefObject<HTMLVideoElement> }) {
    const [supportersInfo, setSupportersInfo] = useState<PickupSupportersRootObject | null>(null)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(Infinity)
    useEffect(() => {
        async function getData() {
            if (!videoInfo.data) return
            const response = await getPickupSupporters(videoInfo.data.response.video.id, 15)
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

    if (currentTime < duration) return null

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
        </div>
        <div className="endcard-right">
            Work in progress!
        </div>
    </div>
}
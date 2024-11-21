import type { VideoDataRootObject } from "@/types/VideoData";
import { readableInt } from "./commonFunction";
import { useEffect, useState } from "react";

type Props = {
    videoInfo: VideoDataRootObject,
}

const weekDay = ["日", "月", "火", "水", "木", "金", "土"];

function Clock() {
    const [ clockString, setClockString ] = useState<string>("")
    useEffect(() => {
        const interval = setInterval(() => {
            const date = new Date()
            setClockString(`${date.getMonth() + 1}/${date.getDate()} (${weekDay[date.getDay()]}) ${date.toLocaleTimeString("en-GB")}`) // en-GBは24時間表記で返す(hh:mm:ss)
        }, 500)
        return () => clearInterval(interval)
    }, [])
    return <div className="videostat-clock">{clockString}</div>
}

export function Stats({ videoInfo }: Props) {
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    return <div className="videostat-container" id="pmw-videostat">
        <div className="videostat-left-container">
            <div>
                <span>再生</span>:<span>{readableInt(videoInfoResponse.video.count.view)}</span>
            </div>
            <div>
                <span>コメント</span>:<span>{readableInt(videoInfoResponse.video.count.comment)}</span>
            </div>
            <div>
                <span>マイリスト</span>:<span>{readableInt(videoInfoResponse.video.count.mylist)}</span>
            </div>
        </div>
        <div className="videostat-right-container">
            <div className="videostat-right-top-dummy">MintWatch Player</div>
            <Clock/>
        </div>
    </div>
}

export function Owner({ videoInfo }: Props) {
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    return <div className="videoowner-container" id="pmw-videoowner">
        {videoInfoResponse.owner && <a href={`https://www.nicovideo.jp/user/${videoInfoResponse.owner.id}`}>
            { videoInfoResponse.owner.iconUrl && <img src={videoInfoResponse.owner.iconUrl}/> }
            <div>
                ユーザー: <br/>
                <span>{ videoInfoResponse.owner.nickname }</span>
            </div>
        </a>}
        {videoInfoResponse.channel && <a href={`https://ch.nicovideo.jp/${videoInfoResponse.channel.id}`}>
            { videoInfoResponse.channel.thumbnail.smallUrl && <img src={videoInfoResponse.channel.thumbnail.smallUrl}/> }
            <div>
                チャンネル: <br/>
                <span>{ videoInfoResponse.channel.name }</span>
            </div>
        </a>}
    </div>
}

export function NicoHarajukuLogo() {
    const [ hidariueNumber, _setHidariueNumber ] = useState([0,0,0].map(n => Math.floor(Math.random() * 9)))
    return <a href="https://www.nicovideo.jp/video_top" className="harajuku-logo">
        <img src={`https://resource.video.nimg.jp/web/img/base/head/icon/nico/${ hidariueNumber.join("") }.gif`} alt="左上"/>
        <img src="http://nicovideo.cdn.nimg.jp/uni/img/logo.gif" alt="ニコニコ動画"/>
    </a>
}
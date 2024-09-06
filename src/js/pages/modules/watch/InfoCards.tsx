import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { secondsToTime } from "./commonFunction";

export function VideoInfo({obj, additionalQuery, isNowPlaying}: { obj: any, additionalQuery?: string, isNowPlaying?: boolean }) {
    const thisVideoId = obj.id || ( obj.content && obj.content.id ) || null
    
    if (!thisVideoId) return <div className="info-card">表示に失敗しました</div>
    return <a className={`info-card ${isNowPlaying ? "info-card-nowplaying" : ""}`} href={`https://www.nicovideo.jp/watch/${thisVideoId}${additionalQuery || ""}`}>
        { (obj.content.thumbnail) && <img src={obj.content.thumbnail.listingUrl}/> }
        <div>
            { isNowPlaying && <span className="info-card-playingtext"><IconPlayerPlayFilled/></span> }{obj.content.title}<br />
            by {obj.content.owner.name} <span className="info-card-durationtext">{secondsToTime(obj.content.duration)}</span>
        </div>
    </a>
}
export function MylistInfo(props: { obj: any }) {
    const obj = props.obj
    return <a className="info-card" href={`https://www.nicovideo.jp/mylist/${obj.id}`}>
        { (obj.content.sampleItems[0].video.thumbnail) && <img src={obj.content.sampleItems[0].video.thumbnail.listingUrl}/> }
        <div>
            {obj.content.name}<br />
            by {obj.content.owner.name} - {obj.content.itemsCount} items
        </div>
    </a>
}

export function InfoCard({ obj }: { obj: any }) {
    if (obj.contentType == "video") return <VideoInfo obj={obj}/>
    if (obj.contentType == "mylist") return <MylistInfo obj={obj}/>
    return <div>Unknown contentType</div>
}
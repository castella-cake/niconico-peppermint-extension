import { IconPlayerPlayFilled, IconPlayerSkipForwardFilled } from "@tabler/icons-react";
import { secondsToTime } from "./commonFunction";
import { playlistVideoItem } from "./Playlist";

export function VideoInfo({obj, additionalQuery, isNowPlaying, isNextVideo = false}: { obj: any, additionalQuery?: string, isNowPlaying?: boolean, isNextVideo?: boolean }) {
    const thisVideoId = obj.id || ( obj.content && obj.content.id ) || null
    
    if (!thisVideoId) return <div className="info-card">表示に失敗しました</div>
    return <a className={`info-card ${isNowPlaying ? "info-card-nowplaying" : ""}`} href={`https://www.nicovideo.jp/watch/${thisVideoId}${additionalQuery || ""}`}>
        { (obj.content.thumbnail) && <img src={obj.content.thumbnail.listingUrl}/> }
        <div>
            { isNowPlaying && <span className="info-card-playingtext"><IconPlayerPlayFilled/></span> }{ isNextVideo && <span className="info-card-playingtext"><IconPlayerSkipForwardFilled/></span>}{obj.content.title}<br />
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

export function PlaylistVideoCard({obj, additionalQuery, isNowPlaying, isNextVideo = false}: { obj: playlistVideoItem, additionalQuery?: string, isNowPlaying?: boolean, isNextVideo?: boolean }) {
    return <a className={`info-card ${isNowPlaying ? "info-card-nowplaying" : ""}`} href={`https://www.nicovideo.jp/watch/${obj.id}${additionalQuery || ""}`}>
        { (obj.thumbnailUrl) && <img src={obj.thumbnailUrl}/> }
        <div>
            { isNowPlaying && <span className="info-card-playingtext"><IconPlayerPlayFilled/></span> }{ isNextVideo && <span className="info-card-playingtext"><IconPlayerSkipForwardFilled/></span>}{obj.title}<br />
            by {obj.ownerName} <span className="info-card-durationtext">{secondsToTime(obj.duration)}</span>
        </div>
    </a>
}

export function InfoCard({ obj, isNextVideo = false }: { obj: any, isNextVideo?: boolean }) {
    if (obj.contentType == "video") return <VideoInfo obj={obj} isNextVideo={isNextVideo}/>
    if (obj.contentType == "mylist") return <MylistInfo obj={obj}/>
    return <div>Unknown contentType</div>
}
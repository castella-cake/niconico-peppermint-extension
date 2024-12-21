import { IconListNumbers, IconPlayerPlayFilled, IconPlayerSkipForwardFilled } from "@tabler/icons-react";
import { secondsToTime } from "./commonFunction";
import { playlistVideoItem } from "./Playlist";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { RecommendItem } from "@/types/RecommendData";
import { useSortable } from "@dnd-kit/sortable";
import { ReactNode } from "react";

function Draggable({ id, obj, children }: { id: string, obj: any, children: ReactNode }) {
    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
        id: `${id}-recommend`,
        data: obj
    });
    const style = {
        ...( isDragging && {pointerEvents: ("none" as React.CSSProperties["pointerEvents"])})
    };
    return <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="draggable-infocard-wrapper">
        { children }
    </div>
}

export function Card({ href, thumbnailUrl, thumbText, ownerName, additionalClassName, children, title }: { href: string, thumbnailUrl?: string, thumbText?: string, ownerName?: string, additionalClassName?: string, children?: ReactNode, title: string }) {
    return <a className={`info-card ${additionalClassName}`} href={href} title={title}>
    { (thumbText) && <div className="info-card-thumbnail">
        <img src={thumbnailUrl} alt={`${title} のサムネイル`}/>
        <span className="info-card-durationtext">{thumbText}</span>
    </div>}
    <div className="info-card-text">
        { children && <span className="info-card-title">{children}</span> }
        { ownerName && <span className="info-card-owner">{ownerName}</span> }
    </div>
</a>
}

export function VideoInfo({obj, additionalQuery, isNowPlaying, isNextVideo = false}: { obj: RecommendItem, additionalQuery?: string, isNowPlaying?: boolean, isNextVideo?: boolean }) {
    const thisVideoId = obj.id || ( obj.content && obj.content.id ) || null
    
    if (!thisVideoId) return <div className="info-card">表示に失敗しました</div>
    return <Draggable id={thisVideoId.toString()} obj={obj}>
        <Card
            thumbnailUrl={obj.content.thumbnail && (obj.content.thumbnail.listingUrl ?? obj.content.thumbnail.url ?? "")}
            thumbText={obj.content.duration ? secondsToTime(obj.content.duration) : "??:??"}
            ownerName={obj.content.owner.name}
            href={`https://www.nicovideo.jp/watch/${thisVideoId}${additionalQuery || ""}`}
            additionalClassName={isNowPlaying ? "info-card-nowplaying" : ""}
            title={obj.content.title ?? "タイトル不明"}
        >
            {isNowPlaying && <span className="info-card-playingtext"><IconPlayerPlayFilled/></span> }
            { isNextVideo && <span className="info-card-playingtext"><IconPlayerSkipForwardFilled/></span>}
            {obj.content.title}<br />
        </Card>
    </Draggable>
}
export function MylistInfo(props: { obj: RecommendItem }) {
    const obj = props.obj
    return <a className="info-card" href={`https://www.nicovideo.jp/mylist/${obj.id}`} title={`マイリスト: ${obj.content.name}`}>
        { (obj.content.sampleItems && obj.content.sampleItems[0].video.thumbnail) && <div className="info-card-thumbnail">
            <img src={obj.content.sampleItems[0].video.thumbnail.listingUrl} alt={`プレイリスト ${obj.content.name} に設定されたサンプルのサムネイル`}/>
            <span className="info-card-durationtext"><IconListNumbers/>{obj.content.itemsCount}</span>
        </div>}
        <div className="info-card-text">
            {obj.content.name}<br />
            <span className="info-card-owner">{obj.content.owner.name}</span>
        </div>
    </a>
}

export function PlaylistVideoCard({obj, additionalQuery, isNowPlaying, isNextVideo = false}: { obj: playlistVideoItem, additionalQuery?: string, isNowPlaying?: boolean, isNextVideo?: boolean }) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: obj.itemId,
        data: obj
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        ...( isDragging && {pointerEvents: ("none" as React.CSSProperties["pointerEvents"]), zIndex: 1000})
    };
    return <a className={`info-card ${isNowPlaying ? "info-card-nowplaying" : ""}`} href={`https://www.nicovideo.jp/watch/${obj.id}${additionalQuery || ""}`} style={style} ref={setNodeRef} {...listeners} {...attributes} title={obj.title}>
        { (obj.thumbnailUrl) && <div className="info-card-thumbnail">
            <img src={obj.thumbnailUrl} alt={`${obj.title} のサムネイル`}/>
            <span className="info-card-durationtext">{secondsToTime(obj.duration)}</span>
        </div>}
        <div className="info-card-text">
            { isNowPlaying && <span className="info-card-playingtext"><IconPlayerPlayFilled/></span> }{ isNextVideo && <span className="info-card-playingtext"><IconPlayerSkipForwardFilled/></span>}{obj.title}<br />
            <span className="info-card-owner">{obj.ownerName}</span>
        </div>
    </a>
}

export function InfoCard({ obj, isNextVideo = false }: { obj: RecommendItem, isNextVideo?: boolean }) {
    if (obj.contentType == "video") return <VideoInfo obj={obj} isNextVideo={isNextVideo}/>
    if (obj.contentType == "mylist") return <MylistInfo obj={obj}/>
    return <div>Unknown contentType</div>
}
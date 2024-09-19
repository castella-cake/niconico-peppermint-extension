import { PlaylistVideoCard } from "./InfoCards";
import { MylistResponseRootObject } from "./types/mylistData";
import { SeriesResponseRootObject } from "./types/seriesData";
import { VideoDataRootObject } from "./types/VideoData";

export type playlistData = {
    type: "mylist" | "series" | "custom" | "none",
    id?: string,
    items: playlistVideoItem[],
}

export type playlistVideoItem = {
    title: string,
    id: string,
    itemId: string,
    ownerName: string | null,
    duration: number,
    thumbnailUrl: string,
}

export function mylistToSimplifiedPlaylist(obj: MylistResponseRootObject) {
    return obj.data.items.map(elem => {
        return {
            title: elem.content.title,
            id: elem.content.id,
            itemId: elem.watchId,
            ownerName: elem.content.owner.name,
            duration: elem.content.duration,
            thumbnailUrl: elem.content.thumbnail.listingUrl,
        }
    }) as playlistVideoItem[]
}

export function seriesToSimplifiedPlaylist(obj: SeriesResponseRootObject) {
    return obj.data.items.map(elem => {
        return {
            title: elem.video.title,
            id: elem.video.id,
            itemId: elem.meta.id,
            ownerName: elem.video.owner.name,
            duration: elem.video.duration,
            thumbnailUrl: elem.video.thumbnail.listingUrl,
        }
    })
}

function Playlist({ playlistData, videoInfo }: { playlistData: playlistData, videoInfo: VideoDataRootObject }) {
    //const [playlistData, setPlaylistData] = useState({} as any);
    let playlistQuery: { type: string, context: any } = {
        type: playlistData.type,
        context: {}
    }
    if ( playlistData.type === "mylist" ) {
        playlistQuery.context = { mylistId: Number(playlistData.id), sortKey: "addedAt", sortOrder: "asc" }
    } else if ( playlistData.type === "series" ) {
        playlistQuery.context = { seriesId: Number(playlistData.id) }
    }
    const query = encodeURIComponent(btoa(JSON.stringify(playlistQuery)));
    return <div className="playlist-container" id="pmw-playlist">
        <div className="playlist-title-container global-flex">
            <div className="playlist-title global-flex1 global-bold">再生キュー</div>
        </div>
        {playlistData.items.length > 0 ? <div className="playlist-items-container">{playlistData.items?.map((item, index) => {
            const isNowPlaying = videoInfo?.data?.response.video.id === item.id
            return <PlaylistVideoCard key={`playlist-${item.itemId}`} obj={item} additionalQuery={`?playlist=${query}`} isNowPlaying={isNowPlaying}/>
        })}</div> : <div className="playlist-nothinghere">
            <p>
                プレイリストは空です。<br/>
                マイリスト/シリーズ/ランキングを選択するか、キューリストに動画を追加してください。
            </p>
        </div>}
    </div>
}


export default Playlist;
import { VideoInfo } from "./InfoCards";
import { PlaylistResponseRootObject } from "./types/playlistData";
import { mylistContext } from "./types/playlistQuery";
import { VideoDataRootObject } from "./types/VideoData";

function Playlist({ playlistData, videoInfo }: { playlistData: PlaylistResponseRootObject | null, videoInfo: VideoDataRootObject }) {
    //const [playlistData, setPlaylistData] = useState({} as any);
    const mylistQuery: { type: string, context: mylistContext } = { type: "mylist", context: { mylistId: Number(playlistData && playlistData.data.id.value), sortKey: "addedAt", sortOrder: "asc" }}
    const query = encodeURIComponent(btoa(`{"type":"mylist","context":${JSON.stringify(mylistQuery)}}`))
    return <div className="playlist-container" id="pmw-playlist">
        <div className="playlist-title-container global-flex">
            <div className="playlist-title global-flex1 global-bold">再生キュー</div>
        </div>
        {playlistData ? <div className="playlist-items-container">{playlistData.data.items.map((item, index) => {
            const isNowPlaying = videoInfo?.data?.response.video.id === item.content.id
            return <VideoInfo key={index} obj={item} additionalQuery={`?playlist=${query}`} isNowPlaying={isNowPlaying}/>
        })}</div> : <div className="playlist-nothinghere">
            <p>
                自動再生するプレイリストはありません。<br/>
                プレイリスト/シリーズ/ランキングを選択するか、キューリストに動画を追加してください。
            </p>
        </div>}
    </div>
}


export default Playlist;
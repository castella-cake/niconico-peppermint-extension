import { linkAction } from "../../../modules/actions"
import { useSSContext } from "./SSContext"

// エピソードリスト。あらかじめ取得されたシリーズ情報を使って表示します。
export function EpisodeList(props) {
    const {lang} = useSSContext()
    const seriesInfo = props.seriesinfo
    if (!seriesInfo || !seriesInfo.data || !seriesInfo.data.items || !seriesInfo.data.detail ) {
        return <div className="episodelist-container" style={{ "--maxheight": `4em` }}>{lang.NO_EPISODE_INFO}</div>
    }
    const playlist = btoa(`{"type":"series","context":{"seriesId":${seriesInfo.data.detail.id}}}`)
    return <div className="episodelist-container" style={{ "--maxheight": `${seriesInfo.data.items.length * 4.0}em` }}>{
        seriesInfo.data.items.map(thisEp => {
            return <a key={thisEp.video.id} className="detailedview-episoderow" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${thisEp.video.id}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${seriesInfo.data.detail.id}`}>
                {thisEp.video.thumbnail.middleUrl && <img src={thisEp.video.thumbnail.middleUrl} className="episoderow-thumbnail" />}
                <div className="episoderow-infocontainer">
                    <span className="episoderow-info-title">{thisEp.video.title}</span>
                    <span className="episoderow-info-date">{new Date(thisEp.video.registeredAt).toLocaleString()}</span>
                </div>
            </a>
        })
    }</div>
}
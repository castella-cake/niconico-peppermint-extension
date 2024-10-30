import { VideoDataRootObject } from "@/types/VideoData";

type Props = {
    videoInfo: VideoDataRootObject
}

function SeriesInfo({videoInfo}: Props) {
    if (!videoInfo.data) return <></>
    const seriesData = videoInfo.data.response.series
    const playlist = btoa(`{"type":"series","context":{"seriesId":${(seriesData && seriesData.id) || 0}}}`)
    return <div className="seriesinfo-container" id="pmw-seriesinfo">
        {seriesData ? <div className="seriesinfo-content">
            <img src={seriesData.thumbnailUrl} alt={`${seriesData.title} のサムネイル`} />
            <div className="seriesinfo-right">
                <div className="seriesinfo-title">
                    <a href={`https://www.nicovideo.jp/series/${encodeURIComponent(seriesData.id)}`}>
                        {seriesData.title}
                    </a>
                </div>
                前の動画: {seriesData.video.prev ? <a href={`https://www.nicovideo.jp/watch/${encodeURIComponent(seriesData.video.prev.id)}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${seriesData.id}`}>{seriesData.video.prev.title}</a> : "前の動画はありません"}<br/>
                次の動画: {seriesData.video.next ? <a href={`https://www.nicovideo.jp/watch/${encodeURIComponent(seriesData.video.next.id)}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${seriesData.id}`}>{seriesData.video.next.title}</a> : "次の動画はありません"}
            </div>
        </div> : 
            <span>この動画に割り当てられているシリーズはありません</span>
        }
    </div>
}


export default SeriesInfo;
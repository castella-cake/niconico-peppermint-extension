import type { VideoDataRootObject } from "./types/VideoData";
import { readableInt } from "./commonFunction";

type Props = {
    videoInfo: VideoDataRootObject,
}

export function Stats({ videoInfo }: Props) {
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    return <div className="videostat-container" id="pmw-videostat">
        <div>
            <span>再　　生　:</span><span>{readableInt(videoInfoResponse.video.count.view)}</span>
        </div>
        <div>
            <span>コメント　:</span><span>{readableInt(videoInfoResponse.video.count.comment)}</span>
        </div>
        <div>
            <span>マイリスト:</span><span>{readableInt(videoInfoResponse.video.count.mylist)}</span>
        </div>
    </div>
}
import { useEffect,  useState } from "react";
//import { useLang } from "../localizeHook";
import { getRecommend } from "../../../modules/watchApi";
import { secondsToTime } from "./commonFunction";
import type { VideoDataRootObject } from "./types/VideoData";
import type { RecommendDataRootObject } from "./types/RecommendData"

function VideoInfo(props: { obj: any }) {
    const obj = props.obj
    return <a className="recommend-item" href={`https://www.nicovideo.jp/watch/${obj.id}`}>
        { (obj.content.thumbnail) && <img src={obj.content.thumbnail.listingUrl}/> }
        <div>
            {obj.content.title}<br />
            by {obj.content.owner.name} <span>{secondsToTime(obj.content.duration)}</span>
        </div>
    </a>
}
function MylistInfo(props: { obj: any }) {
    const obj = props.obj
    return <a className="recommend-item" href={`https://www.nicovideo.jp/mylist/${obj.id}`}>
        { (obj.content.sampleItems[0].video.thumbnail) && <img src={obj.content.sampleItems[0].video.thumbnail.listingUrl}/> }
        <div>
            {obj.content.name}<br />
            by {obj.content.owner.name} - {obj.content.itemsCount} items
        </div>
    </a>
}

function Recommend(props: {smId: string, videoInfo: VideoDataRootObject}) {
    //const lang = useLang()
    const [ recommendData, setRecommendData ] = useState<RecommendDataRootObject>({})
    useEffect(() => {
        async function fetchRecommend() {
            const recommendResponse = await getRecommend(props.smId)
            setRecommendData(recommendResponse)
        }
        fetchRecommend()
    }, [props.videoInfo])
    if (!recommendData.data) return <></>
    return <div className="recommend-container" id="pmw-recommend">
        {recommendData.data.items.map((elem, index) => {
            if (elem.contentType == "video") return <VideoInfo key={`${index}-${elem.id}`} obj={elem}/>
            if (elem.contentType == "mylist") return <MylistInfo key={`${index}-${elem.id}`} obj={elem}/>
            return <div>Unknown contentType</div>
        })}
    </div>
}

export default Recommend;
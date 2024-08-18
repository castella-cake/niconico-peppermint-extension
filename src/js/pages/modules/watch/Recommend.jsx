import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import { getRecommend } from "../../../modules/watchApi";
import { secondsToTime } from "./commonFunction";

function Recommend(props) {
    const lang = useLang()
    const [ recommendData, setRecommendData ] = useState({})
    function VideoInfo(props) {
        const obj = props.obj
        return <a className="recommend-item" href={`https://www.nicovideo.jp/watch/${obj.id}`}>
            { (obj.content.thumbnail) && <img src={obj.content.thumbnail.listingUrl}/> }
            <div>
                {obj.content.title}<br />
                by {obj.content.owner.name} <span>{secondsToTime(obj.content.duration)}</span>
            </div>
        </a>
    }
    function MylistInfo(props) {
        const obj = props.obj
        return <a className="recommend-item" href={`https://www.nicovideo.jp/mylist/${obj.id}`}>
            { (obj.content.sampleItems[0].video.thumbnail) && <img src={obj.content.sampleItems[0].video.thumbnail.listingUrl}/> }
            <div>
                {obj.content.name}<br />
                by {obj.content.owner.name} - {obj.content.itemsCount} items
            </div>
        </a>
    }
    useEffect(() => {
        async function fetchRecommend() {
            const recommendResponse = await getRecommend(props.smId)
            setRecommendData(recommendResponse)
        }
        fetchRecommend()
    }, [props.videoInfo])
    if (!recommendData.data) return <></>
    return <div className="recommend-container">
        {recommendData.data.items.map((elem, index) => {
            if (elem.contentType == "video") return <VideoInfo key={`${index}-${elem.id}`} obj={elem}/>
            if (elem.contentType == "mylist") return <MylistInfo key={`${index}-${elem.id}`} obj={elem}/>
            return <div>Unknown contentType</div>
        })}
    </div>
}

export default Recommend;
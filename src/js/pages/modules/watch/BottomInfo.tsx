import { getCommonsRelatives } from "../../../modules/watchApi";
import type { VideoDataRootObject } from "./types/VideoData";
import { useEffect, useState } from "react";



type Props = {
    videoInfo: VideoDataRootObject
}

function BottomInfo({videoInfo}: Props) {
    const [commonsRelativeData, setCommonsRelativeData] = useState<CommonsRelativeRootObject | null>(null)
    useEffect(() => {
        if (!videoInfo.data || !videoInfo.data.response.external.commons.hasContentTree) return
        async function getData() {
            const fetchedRelativeData: CommonsRelativeRootObject = await getCommonsRelatives(videoInfo.data?.response.video.id)
            setCommonsRelativeData(fetchedRelativeData)
        }
        getData()
    }, [videoInfo])
    if (!videoInfo.data || !commonsRelativeData || !commonsRelativeData.data || !commonsRelativeData.data.children || !commonsRelativeData.data.parents) return <></>

    return <div className="videoinfo-container" id="pmw-bottominfo">
        <div className="videoinfo-title">コンテンツツリー</div>
        <div className="contenttree-kind-container">
            <div className="contenttree-title">親作品</div>
            <div className="contenttree-items-container">
                {commonsRelativeData.data.parents.total !== 0 ? commonsRelativeData.data.parents.contents.map((elem, index) => {
                    return <div className="contenttree-item" key={`parent-${index}-${elem.id}`}><img src={elem.thumbnailURL}></img>{elem.title}</div>
                }) : <div className="contenttree-nothinghere">親作品は何も登録されていません</div>}
            </div>
        </div>
        <div className="contenttree-kind-container">
            <div className="contenttree-title">子作品</div>
            <div className="contenttree-items-container">
                
                {commonsRelativeData.data.children.total !== 0 ? commonsRelativeData.data.children.contents.map((elem, index) => {
                    return <div className="contenttree-item" key={`children-${index}-${elem.id}`}><img src={elem.thumbnailURL}></img>{elem.title}</div>
                }) : <div className="contenttree-nothinghere">子作品は何も登録されていません</div>}
            </div>
        </div>
    </div>
}


export default BottomInfo;
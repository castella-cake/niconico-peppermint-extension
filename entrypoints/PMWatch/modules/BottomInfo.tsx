import { getCommonsRelatives } from "../../modules/watchApi";
import type { VideoDataRootObject } from "../../types/VideoData";
import { useEffect, useRef, useState } from "react";
import SeriesInfo from "./Series";



type Props = {
    videoInfo: VideoDataRootObject
}

function BottomInfo({videoInfo}: Props) {
    const [commonsRelativeData, setCommonsRelativeData] = useState<CommonsRelativeRootObject | null>(null)
    const parentItemsContainerRef = useRef<HTMLDivElement>(null)
    const childrenItemsContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!videoInfo.data || !videoInfo.data.response.external.commons.hasContentTree) return
        async function getData() {
            const fetchedRelativeData: CommonsRelativeRootObject = await getCommonsRelatives(videoInfo.data?.response.video.id)
            setCommonsRelativeData(fetchedRelativeData)
        }
        getData()
    }, [videoInfo.data?.response.video.id])
    useEffect(() => {
        parentItemsContainerRef.current?.addEventListener("wheel", wheelTranslator, { passive: false })
        childrenItemsContainerRef.current?.addEventListener("wheel", wheelTranslator, { passive: false })
        return () => {
            parentItemsContainerRef.current?.removeEventListener("wheel", wheelTranslator)
            childrenItemsContainerRef.current?.removeEventListener("wheel", wheelTranslator)
        }
    })
    if (!videoInfo.data) return <></>
    function wheelTranslator(e: WheelEvent) {
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX) || !e.currentTarget || !(e.currentTarget instanceof HTMLDivElement) || e.currentTarget.scrollWidth <= e.currentTarget.clientWidth) return;
        e.preventDefault();
        e.currentTarget.scrollLeft += e.deltaY;
    }

    return <div className="videoinfo-container bottominfo-container" id="pmw-bottominfo">
        <div className="videoinfo-title">コンテンツツリー</div>
        <div className="contenttree-kind-container">
            <div className="contenttree-title">親作品</div>
            <div className="contenttree-items-container" ref={parentItemsContainerRef}>
                {( commonsRelativeData && commonsRelativeData.data.parents.total !== 0 ) ? commonsRelativeData.data.parents.contents.map((elem, index) => {
                    return <div className="contenttree-item" key={`parent-${elem.id}`}><img src={elem.thumbnailURL}></img>{elem.title}</div>
                }) : <div className="contenttree-nothinghere">親作品は何も登録されていません</div>}
            </div>
        </div>
        <div className="contenttree-kind-container">
            <div className="contenttree-title">子作品</div>
            <div className="contenttree-items-container" ref={childrenItemsContainerRef}>
                {( commonsRelativeData && commonsRelativeData.data.children.total !== 0 ) ? commonsRelativeData.data.children.contents.map((elem, index) => {
                    return <div className="contenttree-item" key={`children-${elem.id}`}><img src={elem.thumbnailURL}></img>{elem.title}</div>
                }) : <div className="contenttree-nothinghere">子作品は何も登録されていません</div>}
            </div>
        </div>
        <SeriesInfo videoInfo={videoInfo}/>
    </div>
}


export default BottomInfo;
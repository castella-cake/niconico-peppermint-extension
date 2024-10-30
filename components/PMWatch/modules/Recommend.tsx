import { useEffect } from "react";
//import { useLang } from "../localizeHook";
import type { RecommendDataRootObject } from "@/types/RecommendData"
import { InfoCard } from "./InfoCards";

function Recommend({recommendData}: {recommendData: RecommendDataRootObject}) {
    //const lang = useLang()
    
    useEffect(() => {
        // 今は要素が利用可能であるということだけを伝えます
        if (recommendData.data) document.dispatchEvent(new CustomEvent("pmw_recommendReady", { detail: "" })) // JSON.stringify({ recommendData: recommendResponse })
    }, [recommendData])
    if (!recommendData.data) return <div className="recommend-container" id="pmw-recommend">レコメンド取得中</div>
    return <div className="recommend-wrapper">
        <div className="recommend-container" id="pmw-recommend">
            {recommendData.data.items.map((elem, index) => {
                return <InfoCard key={`${elem.id}`} obj={elem}/>
            })}
        </div>
    </div>
}

export default Recommend;
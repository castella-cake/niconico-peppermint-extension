import { useEffect,  useState } from "react";
//import { useLang } from "../localizeHook";
import { getRecommend } from "../../../modules/watchApi";
import type { RecommendDataRootObject } from "./types/RecommendData"
import { InfoCard } from "./InfoCards";

function Recommend({smId,}: {smId: string}) {
    //const lang = useLang()
    const [ recommendData, setRecommendData ] = useState<RecommendDataRootObject>({})
    useEffect(() => {
        async function fetchRecommend() {
            const recommendResponse = await getRecommend(smId)
            setRecommendData(recommendResponse)
            // 今はただ要素が利用可能であることだけ伝えます
            document.dispatchEvent(new CustomEvent("pmw_recommendReady", { detail: "" })) // JSON.stringify({ recommendData: recommendResponse })
        }
        fetchRecommend()
    }, [smId])
    if (!recommendData.data) return <></>
    return <div className="recommend-container" id="pmw-recommend">
        {recommendData.data.items.map((elem, index) => {
            return <InfoCard key={`${index}-${elem.id}`} obj={elem}/>
        })}
    </div>
}

export default Recommend;
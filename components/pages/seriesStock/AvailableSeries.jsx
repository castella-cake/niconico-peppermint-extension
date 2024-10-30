import { useEffect, useState } from "react"
import { useSSContext } from "./SSContext"
import { getSeriesInfo } from "./seriesManage"



// 追加可能なシリーズのコンポーネント。
// 現在のタブから追加可能なシリーズを検出して、ユーザーに提案します。(というよりユーザーページからシリーズを追加する手段を提供します)
// 操作: シリーズをストックに追加
export function AvailableSeriesRow() {
    const { lang, syncStorage, setSyncStorageValue } = useSSContext()
    const [addAvailableSeriesId, setAddAvailableSeriesId] = useState(null)
    const [addAvailableSeriesName, setAddAvailableSeriesName] = useState(null)
    const seriesIdArray = ( syncStorage.stockedseries ? syncStorage.stockedseries.map(elem => elem.seriesID).filter(elem => elem != undefined) : [] )
    // .includes(ncStateResult.seriesId)
    useEffect(() => {
        async function getData() {
            const ncStateResult = await new Promise((resolve) => browser.runtime.sendMessage({ type: "getActiveNCState", getType: "series" }, resolve))
            if (ncStateResult && ncStateResult.status == true && ncStateResult.seriesId && !seriesIdArray.includes(ncStateResult.seriesId)) {
                setAddAvailableSeriesId(ncStateResult.seriesId)
                if ( !ncStateResult.name ) {
                    const thisSeriesInfo = await getSeriesInfo(ncStateResult.seriesId)
                    if ( thisSeriesInfo.meta.status == 200 ) {
                        setAddAvailableSeriesName(thisSeriesInfo.data.detail.title)
                    }
                } else {
                    setAddAvailableSeriesName(ncStateResult.name)
                }
            } 
        }
        getData()
    }, [])

    function addSeriesStock(seriesId, seriesName) {
        if ( syncStorage.stockedseries ) {
            setSyncStorageValue("stockedseries", [{ seriesID: seriesId, seriesName: seriesName }, ...syncStorage.stockedseries])
        }
    }

    return <>{( addAvailableSeriesId && addAvailableSeriesName ) && <div className="stockedseries-add-row">
        <div style={{ flexGrow: 1 }}>{lang.ADD_AVAILABLE_FROM_CURRENT_TAB}: {addAvailableSeriesName}</div>
        <button type="button" onClick={() => {
            addSeriesStock(addAvailableSeriesId, addAvailableSeriesName)
        }}>{lang.ADD}</button>
    </div>}</>
}
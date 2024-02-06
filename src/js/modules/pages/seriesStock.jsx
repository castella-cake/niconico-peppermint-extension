import React, { useEffect, useState, memo, Suspense } from "react";
import { getSyncStorageData } from "../storageControl";
import { linkAction } from "../actions";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import lang from "../../../langs/ja.json";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

function CreateSeriesStockBlock() {
    const [syncStorage, setSyncStorageVar] = useState({})
    const [isUnlocked, setIsUnlockedVar] = useState(false)
    const [seriesStockVar, setSeriesStockVar] = useState({ seriesInfo: {}, episodeLists: {} })
    const StockRowMemo = memo((props) => <SeriesStockRow storage={props.storage} seriesinfo={props.seriesinfo} />)
    useEffect(() => {
        console.log("useEffect called")
        function getSeriesInfo(id) {
            return new Promise((resolve, reject) => {
                try {
                    chrome.runtime.sendMessage({ "type": "getSeriesInfo", "seriesID": id }, resolve)
                } catch (err) {
                    reject(err)
                }
            })
        }
        async function getData() {
            let storage = await getSyncStorageData
            setSyncStorageVar(storage)
            const seriesInfoObj = {}
            const episodeListObj = {}
            if (storage.stockedseries) {
                const infoArray = await Promise.allSettled(storage.stockedseries.map(async elem => {
                    return await getSeriesInfo(elem.seriesID)
                }))
                infoArray.map(elem => {
                    if (elem.status == "fulfilled" && elem.value) {
                        const res = elem.value
                        if (res.meta && res.meta.status == 200 && res.data && res.data.detail && res.data.detail.id) {
                            seriesInfoObj[res.data.detail.id] = res
                            const playlist = btoa(`{"type":"series","context":{"seriesId":${res.data.detail.id}}}`)
                            episodeListObj[res.data.detail.id] = res.data.items.map(thisEp => {
                                return <a key={thisEp.video.id} className="detailedview-episoderow" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${thisEp.video.id}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${res.data.detail.id}`}>
                                    {thisEp.video.thumbnail.middleUrl && <img src={thisEp.video.thumbnail.middleUrl} className="episoderow-thumbnail" />}
                                    <div className="episoderow-infocontainer">
                                        <span className="episoderow-info-title">{thisEp.video.title}</span>
                                        <span className="episoderow-info-date">{new Date(thisEp.video.registeredAt).toLocaleString()}</span>
                                    </div>
                                </a>
                            })
                        }
                    }
                })
            }
            setSeriesStockVar({ seriesInfo: seriesInfoObj, episodeLists: episodeListObj })
        }
        getData()
    }, [])
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    function SeriesStockRow(props) {
        const storage = props.storage
        const seriesInfo = props.seriesinfo
        console.log("Render called")
        if (storage.stockedseries) {
            const rowList = storage.stockedseries.map(elem => {
                let seriesHref = `https://www.nicovideo.jp/series/${elem.seriesID}`
                // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
                // 内容はJSONで、Base64でエンコードします
                let playlist = btoa(`{"type":"series","context":{"seriesId":${elem.seriesID}}}`)
                const titleRegexp = new RegExp(`^${elem.seriesName}( |　)*`)
                const [isDetailedViewExpanded, setDetailedViewExpanded] = useState(false)
                // elem.idはstringである必要があるため、`で変換する
                const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.seriesID.toString(), disabled: !isUnlocked })
                const dndStyle = { transform: CSS.Transform.toString(transform), transition, }

                return <div className="stockedseries-row" key={elem.seriesID} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                    <div className={isDetailedViewExpanded ? "stockedseries-desc-container detailedviewexpanded" : "stockedseries-desc-container"}>
                        <div className="serieslink-container">
                            {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.thumbnailUrl) && <img src={seriesInfo[elem.seriesID].data.detail.thumbnailUrl} title={seriesInfo[elem.seriesID].data.detail.title + "のサムネイル"} className="stockedseries-row-thumbnail" />}
                            <div className="seriesinfo-container">
                                <a className="stockedseries-row-link" href={seriesHref} target="_blank">{elem.seriesName}</a>
                                <button className="removeseries"><DeleteOutlined /></button>
                                {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.owner) &&
                                    (seriesInfo[elem.seriesID].data.detail.owner.type == "channel" ?
                                        <div className="stockedseries-row-owner">
                                            チャンネル:
                                            <a href={"https://nico.ms/" + seriesInfo[elem.seriesID].data.detail.owner.channel.id} className="stockedseries-row-ownerlink">{seriesInfo[elem.seriesID].data.detail.owner.channel.name}</a>
                                        </div>
                                        : <div className="stockedseries-row-owner">
                                            ユーザー:
                                            <a href={"https://nico.ms/user/" + seriesInfo[elem.seriesID].data.detail.owner.user.id} className="stockedseries-row-ownerlink" style={seriesInfo[elem.seriesID].data.detail.owner.user.isPremium && { color: "#d9a300" }}>{seriesInfo[elem.seriesID].data.detail.owner.user.nickname}</a>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="stockedseries-vidlink-container">
                            {elem.lastVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${elem.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><PlayArrowOutlinedIcon />最後に見た動画<span>{elem.lastVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><PlayArrowOutlinedIcon />最後に見た動画<span>まだ保存されていません</span></a>}
                            {elem.nextVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${elem.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><SkipNextOutlinedIcon />次の動画<span>{elem.nextVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><SkipNextOutlinedIcon />次の動画<span>まだ保存されていません</span></a>}
                        </div>
                        {(seriesInfo[elem.seriesID]) && (seriesInfo[elem.seriesID].data.items ? <div className="episodelist-container" style={{ "--maxheight": `${seriesInfo[elem.seriesID].data.items.length * 4.0}em` }}>{seriesStockVar.episodeLists[elem.seriesID]}</div> : <div className="episodelist-container" style={{ "--maxheight": `4em` }}>シリーズにエピソード情報がありません。</div>)}
                        <button type="button" className="expanddetailedview" onClick={() => { setDetailedViewExpanded(!isDetailedViewExpanded) }}>
                            {(seriesInfo[elem.seriesID]) ? (isDetailedViewExpanded ? <><ExpandLessOutlinedIcon />詳細を隠す<ExpandLessOutlinedIcon /></> : <><ExpandMoreOutlinedIcon />詳細を表示<ExpandMoreOutlinedIcon /></>) : <><ExpandMoreOutlinedIcon /><span style={{ color: "var(--textcolor2)" }}>ロード中...</span><ExpandMoreOutlinedIcon /></>}
                        </button>
                    </div>
                </div>
            })
            //console.log(rowList)
            return <>{rowList}</>

        } else {
            return <span>ストック中のシリーズが一つもありません。</span>
        }
    }
    function setSyncStorageValue(name, value) {
        setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }

    function handleDragEnd(e) {
        const {active, over} = e;
        if (active.id !== over.id) {
            const currentIdList = syncStorage.stockedseries.map(elem => { return elem.seriesID.toString() });
            const oldIndex = currentIdList.indexOf(active.id);
            const newIndex = currentIdList.indexOf(over.id);
            const sortAfterIdList = arrayMove(currentIdList, oldIndex, newIndex);
            const sortAfterStockedSeries = syncStorage.stockedseries.sort((a, b) => sortAfterIdList.indexOf(a.seriesID) - sortAfterIdList.indexOf(b.seriesID))
            setSyncStorageValue("stockedseries", sortAfterStockedSeries)
        }
    }

    return <div className="seriesstock-block">
        <h2 className="seriesstocktitle">{`シリーズストック (${(syncStorage.stockedseries ?? []).length})`}<button className="togglelock" title={isUnlocked ? "ロック状態に変更" : "ロック解除"} type="button" onClick={() => { setIsUnlockedVar(!isUnlocked) }}>{isUnlocked ? <LockOpenOutlined style={{ fontSize: 22 }} /> : <LockOutlinedIcon style={{ fontSize: 22 }} />}</button></h2>
        <div className={"stockedserieslist-container" + " " + (isUnlocked ? "stocklist-unlocked" : "")}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={syncStorage.stockedseries ? syncStorage.stockedseries.map(elem => { return elem.seriesID.toString() }) : []}
                    strategy={verticalListSortingStrategy}
                >
                    <SeriesStockRow storage={syncStorage} seriesinfo={seriesStockVar.seriesInfo} />
                </SortableContext>
            </DndContext>
        </div>
    </div>
}


export default CreateSeriesStockBlock;
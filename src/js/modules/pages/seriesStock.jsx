import React, { useEffect, useState, memo, Suspense, useRef } from "react";
import { getSyncStorageData } from "../storageControl";
import { linkAction } from "../actions";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import lang from "../../../langs/ja.json";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import { Add, CreateNewFolder, Folder, FolderOutlined } from "@mui/icons-material";

function CreateSeriesStockBlock() {
    const [syncStorage, setSyncStorageVar] = useState({})
    const [isUnlocked, setIsUnlockedVar] = useState(false)
    const [isFolderCreateWindow, setIsFolderCreateWindowVar] = useState(false)
    //const StockRowMemo = memo((props) => <SeriesStockRow storage={props.storage} seriesinfo={props.seriesinfo} />)
    useEffect(() => {
        async function getData() {
            let storage = await getSyncStorageData
            setSyncStorageVar(storage)
        }
        getData()
    }, [])
    function setSyncStorageValue(name, value) {
        setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }
    function getSeriesInfo(id) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage({ "type": "getSeriesInfo", "seriesID": id }, resolve)
            } catch (err) {
                reject(err)
            }
        })
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function SeriesStockRow(props) {
        const storage = props.storage
        const [seriesStockVar, setSeriesStockVar] = useState({ seriesInfo: {}, episodeLists: {} })
        useEffect(() => {
            async function getData() {
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

        function CreateRowList(props) {
            const array = props.array
            // 個別表示するべきかしないべきかを判断するために、一旦シリーズストック内にあるフォルダーを見て、個別表示してはならないIDを列挙する
            // mapでIDリストを取ってから、reduceで繋げる
            const inFolderElemIdList = array.map(elem => {
                if ( elem.type == "folder" && elem.idList && elem.idList.length > 0 ) {
                    return elem.idList
                } else {
                    return null
                }
            }).reduce((acm, elem) => {
                if ( acm ) {
                    return acm.concat(elem)
                }
            }, []).filter(elem => elem != null)
            return <>{ array.map(elem => {
                // どっかのフォルダーにいるなら個別表示しちゃダメなので帰って
                if ( elem.seriesID && inFolderElemIdList && inFolderElemIdList.includes(elem.seriesID) ) {
                    return
                }
                if ( elem.type == "folder" ) {
                    // そのフォルダーにいるやつを現在のArrayからフィルターする
                    const folderContent = array.filter(item => {
                        if ( !item.seriesID || item.type == "folder" ) {
                            return false
                        } 
                        return elem.idList.includes(item.seriesID)
                    })

                    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.id.toString(), disabled: !isUnlocked })
                    const Style = { transform: CSS.Translate.toString(transform), transition, borderLeft: "4px solid var(--textcolor3)" }

                    // 後はリストをこの関数で作ってもらう
                    return <div className="stockedseries-row" key={elem.id} ref={setNodeRef} style={Style} {...attributes} {...listeners}>
                        <div className="stockedseries-folder-title"><FolderOutlined style={{ fontSize: 16 }}/>{elem.name}</div>
                        <details open={isUnlocked}>
                            <summary>内容を表示</summary>
                            <div className="stockedseries-folder-details">
                                <DndContext
                                    sensors={sensors}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <SortableContext
                                        items={folderContent ? folderContent.map(elem => { return elem.seriesID.toString() }) : []}
                                        strategy={verticalListSortingStrategy}
                                        id={`${elem.id}-sortable`}
                                    >
                                        <CreateRowList array={folderContent}/>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </details>
                    </div>
                } else {
                    let seriesHref = `https://www.nicovideo.jp/series/${elem.seriesID}`
                    // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
                    // 内容はJSONで、Base64でエンコードします
                    let playlist = btoa(`{"type":"series","context":{"seriesId":${elem.seriesID}}}`)
                    const titleRegexp = new RegExp(`^${elem.seriesName}( |　)*`)
                    const [isDetailedViewExpanded, setDetailedViewExpanded] = useState(false)
                    // elem.idはstringである必要があるため、toStringで変換する
                    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.seriesID.toString(), disabled: !isUnlocked })
                    const dndStyle = { transform: CSS.Translate.toString(transform), transition, }

                    return <div className="stockedseries-row" key={elem.seriesID} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                        <div className={isDetailedViewExpanded ? "stockedseries-desc-container detailedviewexpanded" : "stockedseries-desc-container"}>
                            <div className="serieslink-container">
                                {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.thumbnailUrl) && <img src={seriesInfo[elem.seriesID].data.detail.thumbnailUrl} title={seriesInfo[elem.seriesID].data.detail.title + lang.THUMB_ALT_TEXT} className="stockedseries-row-thumbnail" />}
                                <div className="seriesinfo-container">
                                    <a className="stockedseries-row-link" href={seriesHref} target="_blank">{elem.seriesName}</a>
                                    <button className="removeseries"><DeleteOutlined /></button>
                                    {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.owner) &&
                                        (seriesInfo[elem.seriesID].data.detail.owner.type == "channel" ?
                                            <div className="stockedseries-row-owner">
                                                {lang.CHANNEL}:
                                                <a href={"https://nico.ms/" + seriesInfo[elem.seriesID].data.detail.owner.channel.id} className="stockedseries-row-ownerlink">{seriesInfo[elem.seriesID].data.detail.owner.channel.name}</a>
                                            </div>
                                            : <div className="stockedseries-row-owner">
                                                {lang.USER}:
                                                <a href={"https://nico.ms/user/" + seriesInfo[elem.seriesID].data.detail.owner.user.id} className="stockedseries-row-ownerlink" style={seriesInfo[elem.seriesID].data.detail.owner.user.isPremium && { color: "#d9a300" }}>{seriesInfo[elem.seriesID].data.detail.owner.user.nickname}</a>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="stockedseries-vidlink-container">
                                {elem.lastVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${elem.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><PlayArrowOutlinedIcon />{lang.LASTVID_TITLE}<span>{elem.lastVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><PlayArrowOutlinedIcon />{lang.LASTVID_TITLE}<span>{lang.NO_TRACKED_VIDEO}</span></a>}
                                {elem.nextVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${elem.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><SkipNextOutlinedIcon />{lang.NEXTVID_TITLE}<span>{elem.nextVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><SkipNextOutlinedIcon />{lang.NEXTVID_TITLE}<span>{lang.NO_TRACKED_VIDEO}</span></a>}
                            </div>
                            {(seriesInfo[elem.seriesID]) && (seriesInfo[elem.seriesID].data.items && isDetailedViewExpanded ? <div className="episodelist-container" style={{ "--maxheight": `${seriesInfo[elem.seriesID].data.items.length * 4.0}em` }}>{seriesStockVar.episodeLists[elem.seriesID]}</div> : <div className="episodelist-container" style={{ "--maxheight": `4em` }}>{lang.NO_EPISODE_INFO}</div>)}
                            <button type="button" className="expanddetailedview" onClick={() => { setDetailedViewExpanded(!isDetailedViewExpanded) }}>
                                {(seriesInfo[elem.seriesID]) ? (isDetailedViewExpanded ? <><ExpandLessOutlinedIcon />{lang.HIDE_DETAILS}<ExpandLessOutlinedIcon /></> : <><ExpandMoreOutlinedIcon />{lang.SEE_DETAILS}<ExpandMoreOutlinedIcon /></>) : <><ExpandMoreOutlinedIcon /><span style={{ color: "var(--textcolor2)" }}>{lang.LOADING}</span><ExpandMoreOutlinedIcon /></>}
                            </button>
                        </div>
                    </div>
                }
            })
            }</>
        }

        const seriesInfo = seriesStockVar.seriesInfo
        console.log("Render called")
        if (storage.stockedseries) {
            return <CreateRowList array={storage.stockedseries} />

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
            const currentIdList = syncStorage.stockedseries.map(elem => { return (elem.seriesID ? elem.seriesID.toString() : elem.id)});
            const oldIndex = currentIdList.indexOf(active.id);
            const newIndex = currentIdList.indexOf(over.id);
            const stockArrayCopy = syncStorage.stockedseries.slice()
            const sortAfter = arrayMove(stockArrayCopy, oldIndex, newIndex);
            setSyncStorageValue("stockedseries", sortAfter)
        }
    }

    const folderNameInputRef = useRef(null)
    function addFolder(name) {
        const addAfter = syncStorage.stockedseries.slice()
        addAfter.unshift({type: "folder", name: name, id: crypto.randomUUID(), idList: ["360103", "67989"]})
        setSyncStorageValue("stockedseries", addAfter)
    }

    return <div className="block-container">
        <h2 className="block-title">
            {`シリーズストック (${(syncStorage.stockedseries ?? []).length})`}
            <button className="block-title-actionbutton" title={isUnlocked ? "ロック状態に変更" : "ロック解除"} type="button" onClick={() => { setIsUnlockedVar(!isUnlocked) }}>{isUnlocked ? <LockOpenOutlined style={{ fontSize: 22 }} /> : <LockOutlinedIcon style={{ fontSize: 22 }} />}</button>
            <button className="block-title-actionbutton" title="フォルダーを追加" type="button" onClick={() => { setIsFolderCreateWindowVar(!isFolderCreateWindow) }}><CreateNewFolder/></button>
        </h2>
        { isFolderCreateWindow && <><input placeholder="フォルダー名を入力" ref={folderNameInputRef}></input><button type="button" onClick={() => {addFolder(folderNameInputRef.current.value)}}>追加</button></>}
        <div className={"stockedserieslist-container" + " " + (isUnlocked ? "stocklist-unlocked" : "")}>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={syncStorage.stockedseries ? syncStorage.stockedseries.map(elem => { return (elem.seriesID ? elem.seriesID.toString() : elem.id) }) : []}
                    strategy={verticalListSortingStrategy}
                    id="root-sortable"
                >
                    <SeriesStockRow storage={syncStorage}/>
                </SortableContext>
            </DndContext>
        </div>
    </div>
}


export default CreateSeriesStockBlock;
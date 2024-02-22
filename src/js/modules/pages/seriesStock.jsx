import React, { useEffect, useState, useRef } from "react";
import { getSyncStorageData } from "../storageControl";
import { linkAction } from "../actions";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import FocusLock from 'react-focus-lock';

import lang from "../../../langs/ja.json";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined"
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined"
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined"
import EditOutlined from "@mui/icons-material/EditOutlined";

function CreateSeriesStockBlock() {
    const [syncStorage, setSyncStorageVar] = useState({})
    const [isUnlocked, setIsUnlockedVar] = useState(false)
    const [isFolderCreateWindow, setIsFolderCreateWindowVar] = useState(false)
    const [fcDefaultSelected, setFCDefaultSelected] = useState([]);
    const [fcEditId, setFCEditId] = useState(null)
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
    function addToFolder(folderId, seriesId) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
            const index = syncStorage.stockedseries.findIndex(elem => elem.id === folderId)
            if ( syncStorage.stockedseries[index].idList.includes(seriesId) ) return

            const stockArrayCopy = syncStorage.stockedseries.slice()
            stockArrayCopy[index].idList.push(seriesId)
            setSyncStorageValue("stockedseries", stockArrayCopy)
        }
    }
    function removeSeriesStock(seriesid) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(series => series.seriesID === seriesid) != -1) {
            const newStock = syncStorage.stockedseries.filter(obj => obj.seriesID !== seriesid);
            setSyncStorageValue("stockedseries", newStock)
        }
    }
    function removeFolder(folderId) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
            const newStock = syncStorage.stockedseries.filter(obj => obj.id !== folderId);
            setSyncStorageValue("stockedseries", newStock)
        }
    }
    function removeFromFolder(folderId, index, seriesId) {
        if ( syncStorage.stockedseries[index] && syncStorage.stockedseries[index].type == "folder" && syncStorage.stockedseries[index].id == folderId ) {
            const stockArrayCopy = syncStorage.stockedseries.slice()
            stockArrayCopy[index].idList = stockArrayCopy[index].idList.filter(elem => elem !== seriesId)
            setSyncStorageValue("stockedseries", stockArrayCopy)
        }
    }
    function setFolder(folderId, index, obj) {
        if ( syncStorage.stockedseries[index] && syncStorage.stockedseries[index].type == "folder" && syncStorage.stockedseries[index].id == folderId ) {
            const stockArrayCopy = syncStorage.stockedseries.slice()
            stockArrayCopy[index] = obj
            setSyncStorageValue("stockedseries", stockArrayCopy)
        }
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
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
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
            return <>{ array.map((elem, index)=> {
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
                    const [ isOpen, setIsOpen ] = useState(false)

                    // 後はリストをこの関数で作ってもらう
                    return <div className="stockedseries-row stockedseries-row-folder" key={elem.id} ref={setNodeRef} style={Style} {...attributes} {...listeners}>
                        <div className="serieslink-container">
                            <div className="stockedseries-folder-title" style={!isUnlocked ? {flexGrow: 1} : {}}><FolderOutlinedIcon style={{ fontSize: 16 }}/>{elem.name}</div>
                            {!isUnlocked && <button type="button" onClick={() => {setIsOpen(!isOpen)}} className="stockedseries-folder-openbutton">{isOpen ? <>フォルダーを閉じる<ExpandLessOutlinedIcon/></>: <>フォルダーを開く<ExpandMoreOutlinedIcon/></>}</button>}
                            <button className="stockedseries-row-actionbutton" onClick={() => {setFCEditId(elem.id);setIsFolderCreateWindowVar(true)}}><EditOutlined /></button>
                            <button className="stockedseries-row-actionbutton" onClick={() => {removeFolder(elem.id)}}><DeleteOutlined /></button>
                        </div>
                        <div className="stockedseries-folder-details" style={(!isOpen && !isUnlocked) ? {display: "none"} : {}}>
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
                                    <CreateRowList array={folderContent} isfolder={true} folderid={elem.id} folderindex={index}/>
                                </SortableContext>
                            </DndContext>
                        </div>
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
                    const [isMoveWindowOpen, setMoveWindowOpen] = useState(false) 

                    const folderSelectRef = useRef(null)
                    return <div className="stockedseries-row" key={elem.seriesID} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                        <div className={isDetailedViewExpanded ? "stockedseries-desc-container detailedviewexpanded" : "stockedseries-desc-container"}>
                            <div className="serieslink-container">
                                {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.thumbnailUrl) && <img src={seriesInfo[elem.seriesID].data.detail.thumbnailUrl} title={seriesInfo[elem.seriesID].data.detail.title + lang.THUMB_ALT_TEXT} className="stockedseries-row-thumbnail" />}
                                <div className="seriesinfo-container">
                                    <a className="stockedseries-row-link" href={seriesHref} target="_blank">{elem.seriesName}</a>
                                    { !isMoveWindowOpen && 
                                        <>{props.isfolder ? <button className="stockedseries-row-actionbutton" onClick={() => {removeFromFolder(props.folderid, props.folderindex, elem.seriesID)}}>フォルダから除去</button> : 
                                        <button className="stockedseries-row-actionbutton" onClick={() => {setMoveWindowOpen(!isMoveWindowOpen)}}><DriveFileMoveOutlinedIcon/></button>}
                                        <button className="stockedseries-row-actionbutton" onClick={() => {removeSeriesStock(elem.seriesID)}}><DeleteOutlined /></button></>
                                    }
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
                            { isMoveWindowOpen && <div style={{display: "flex", flexWrap: "wrap", justifyContent: "right"}} className="stockedseries-movecontainer">
                                <div className="folderselector-container">
                                    移動先フォルダー
                                    <select ref={folderSelectRef}>
                                        {array.filter(elem => elem.type == "folder").map(elem => {
                                            return <option type="button" className="context-button" value={elem.id}>{elem.name}</option>
                                        })}
                                    </select>
                                </div>
                                <div className="buttons-container">
                                    <button type="button" onClick={() => {
                                        addToFolder(folderSelectRef.current.value, elem.seriesID)
                                        setMoveWindowOpen(false)
                                    }}>指定フォルダーに移動</button>
                                    <button type="button" onClick={() => {
                                        setFCDefaultSelected([...fcDefaultSelected, elem.seriesID])
                                        setIsFolderCreateWindowVar(true)
                                        setMoveWindowOpen(false)
                                    }}>新規フォルダー...</button>
                                    <button type="button" onClick={() => {setMoveWindowOpen(false)}}>キャンセル</button>
                                </div>
                            </div> }
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

    function addFolder(name, idList = []) {
        const addAfter = syncStorage.stockedseries.slice()
        addAfter.unshift({type: "folder", name: ( (name != "" && name) ? name : "名称未設定のフォルダー"), id: crypto.randomUUID(), idList: idList})
        setSyncStorageValue("stockedseries", addAfter)
    }

    function CreateFolderWindow(props) {
        const syncStorage = props.storage
        const [seriesInfo, setSeriesInfoVar] = useState({})
        useEffect(() => {
            async function getData() {
                const seriesInfoObj = {}
                if (syncStorage.stockedseries) {
                    const infoArray = await Promise.allSettled(syncStorage.stockedseries.map(async elem => {
                        return await getSeriesInfo(elem.seriesID)
                    }))
                    infoArray.map(elem => {
                        if (elem.status == "fulfilled" && elem.value) {
                            const res = elem.value
                            if (res.meta && res.meta.status == 200 && res.data && res.data.detail && res.data.detail.id) {
                                seriesInfoObj[res.data.detail.id] = res
                            }
                        }
                    })
                }
                setSeriesInfoVar(seriesInfoObj)
            }
            getData()
        }, [])
        const editFolderIndex = (fcEditId != null ? syncStorage.stockedseries.findIndex(elem => elem.id === fcEditId) : -1);
        const editFolderObj = (editFolderIndex != -1 ? syncStorage.stockedseries[editFolderIndex] : undefined)
        const [ checkedIds, setCheckedIds ] = useState([].concat((editFolderObj ? editFolderObj.idList : fcDefaultSelected)))
        const folderNameInputRef = useRef(null)
        function onSeriesCheckboxChanged(checked, seriesId) {
            if ( checked ) {
                setCheckedIds([...checkedIds, seriesId])
            } else if ( !checked && checkedIds.includes(seriesId)){
                setCheckedIds(checkedIds.filter(elem => elem != seriesId))
            }
        }
        return <div className="quickpanel-window-container">
            <FocusLock>
                <div className="quickpanel-window">
                    <h2 className="window-title">{editFolderObj ? "フォルダーの編集" : "フォルダーの作成"}</h2>
                    <div className="window-body">
                        {editFolderObj ? `フォルダーを編集します。\n
                        表示されているシリーズは、現在追加/削除可能なシリーズのリストです。\n
                        チェックボックスを有効化すると、フォルダーに選択されたシリーズが移動されます。`
                        : `現在のシリーズストック内に新しいフォルダーを作成します。\n
                        表示されているシリーズは、現在移動可能なシリーズのリストです。\n
                        チェックボックスを有効化すると、フォルダーに選択したシリーズが移動されます。`}
                        <h3 className="window-section-title">フォルダーの名前</h3>
                        <input placeholder="フォルダー名を入力..." ref={folderNameInputRef} className="createfolder-nameinput" defaultValue={editFolderObj && editFolderObj.name}></input>
                        <h3 className="window-section-title">フォルダーにシリーズを移動</h3>
                        <div className="createfolder-selectcontainer">
                            { syncStorage.stockedseries.filter(elem => elem.type != "folder").map(elem => {
                                return <div className="stockedseries-row" key={elem.seriesID}>
                                    <input type="checkbox" value={elem.seriesID} onChange={(e) => onSeriesCheckboxChanged(e.currentTarget.checked, elem.seriesID)} checked={checkedIds.includes(elem.seriesID)}/>
                                    {elem.seriesName}
                                    {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.owner) &&
                                        (seriesInfo[elem.seriesID].data.detail.owner.type == "channel" ?
                                            <span className="stockedseries-row-owner" style={{ marginLeft: 16 }}>
                                                {lang.CHANNEL}:
                                                <a href={"https://nico.ms/" + seriesInfo[elem.seriesID].data.detail.owner.channel.id} className="stockedseries-row-ownerlink">{seriesInfo[elem.seriesID].data.detail.owner.channel.name}</a>
                                            </span>
                                            : <span className="stockedseries-row-owner" style={{ marginLeft: 16 }}>
                                                {lang.USER}:
                                                <a href={"https://nico.ms/user/" + seriesInfo[elem.seriesID].data.detail.owner.user.id} className="stockedseries-row-ownerlink" style={seriesInfo[elem.seriesID].data.detail.owner.user.isPremium && { color: "#d9a300" }}>{seriesInfo[elem.seriesID].data.detail.owner.user.nickname}</a>
                                            </span>
                                        )
                                    }
                                </div>
                            })}
                        </div>
                        <div className="window-button-container">
                            <button type="button" onClick={() => {setIsFolderCreateWindowVar(false);setFCDefaultSelected([]);setFCEditId(null);}} className="window-button">× 閉じる</button>
                            <button type="button" onClick={() => {
                                if ( editFolderObj ) {
                                    setFolder(editFolderObj.id, editFolderIndex, {...editFolderObj, name: folderNameInputRef.current.value, idList: checkedIds})
                                } else {
                                    addFolder(folderNameInputRef.current.value, checkedIds);
                                }
                                setIsFolderCreateWindowVar(false);
                                setFCDefaultSelected([]);
                                setFCEditId(null)
                            }} className="window-button window-button-primary">{editFolderObj ? "変更を保存" : "フォルダーを追加"}</button>
                        </div>
                    </div>
                </div>
            </FocusLock>
        </div>
    }
    if ( isFolderCreateWindow ) {
        document.body.style.overflow = "hidden"
    } else {
        document.body.style.overflow = "unset"
    }
    return <div className="block-container">
        <h2 className="block-title">
            {`シリーズストック (${(syncStorage.stockedseries ?? []).length})`}
            <button className="block-title-actionbutton" title={isUnlocked ? "ロック状態に変更" : "ロック解除"} type="button" onClick={() => { setIsUnlockedVar(!isUnlocked) }}>{isUnlocked ? <LockOpenOutlined style={{ fontSize: 22 }} /> : <LockOutlinedIcon style={{ fontSize: 22 }} />}</button>
            <button className="block-title-actionbutton" title="フォルダーを追加" type="button" onClick={() => { setIsFolderCreateWindowVar(!isFolderCreateWindow) }}><CreateNewFolderOutlinedIcon/></button>
        </h2>
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
        { isFolderCreateWindow && <CreateFolderWindow storage={syncStorage}/>}
    </div>
}


export default CreateSeriesStockBlock;
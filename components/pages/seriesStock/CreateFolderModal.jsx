import FocusLock from 'react-focus-lock';
import { useSSContext } from "./SSContext"
import { getSeriesInfo } from './seriesManage';
import { useEffect, useRef, useState } from 'react';

// フォルダー編集/作成モーダル。
// フォルダー名の決定と追加するシリーズの決定を行います。
// fcDefaultSelectedにシリーズIDの配列を渡すことで、ストック中のシリーズをあらかじめチェックします。
// fcEditIdにフォルダーIDを渡すことで、そのフォルダーを編集するモーダルとして機能します。
// 操作: フォルダーの作成, フォルダーの変更
export function CreateFolderModal() {
    const {
        syncStorage, setSyncStorageValue,
        fcDefaultSelected, setFCDefaultSelected, 
        fcEditId, setFCEditId, 
        setIsFolderCreateWindowVar, isFolderCreateWindow, lang
    } = useSSContext()

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

    function addFolder(name, idList = []) {
        const addAfter = syncStorage.stockedseries.slice()
        addAfter.unshift({type: "folder", name: ( (name != "" && name) ? name : "名称未設定のフォルダー"), id: crypto.randomUUID(), idList: idList})
        setSyncStorageValue("stockedseries", addAfter)
    }
    function setFolder(folderId, index, obj) {
        if ( syncStorage.stockedseries[index] && syncStorage.stockedseries[index].type == "folder" && syncStorage.stockedseries[index].id == folderId ) {
            const stockArrayCopy = syncStorage.stockedseries.slice()
            stockArrayCopy[index] = obj
            setSyncStorageValue("stockedseries", stockArrayCopy)
        }
    }
    
    return <div className="quickpanel-window-container">
        <FocusLock>
            <div className="quickpanel-window">
                <h2 className="window-title">{editFolderObj ? lang.EDIT_FOLDER_TITLE : lang.ADD_FOLDER_TITLE}</h2>
                <div className="window-body">
                    <div style={{whiteSpace: "pre-wrap"}}>
                        {editFolderObj ? lang.EDIT_FOLDER_DESC
                        : lang.ADD_FOLDER_DESC}
                    </div>
                    <h3 className="window-section-title">{lang.FOLDER_NAME}</h3>
                    <input placeholder={lang.PLACEHOLDER_FOLDER_NAME} ref={folderNameInputRef} className="createfolder-nameinput" defaultValue={editFolderObj && editFolderObj.name}></input>
                    <h3 className="window-section-title">{lang.MOVE_SERIES_TO_FOLDER}</h3>
                    <div className="createfolder-selectcontainer">
                        { syncStorage.stockedseries && syncStorage.stockedseries.filter(elem => elem.type != "folder").map(elem => {
                            return <div className="stockedseries-row" key={elem.seriesID}>
                                <input type="checkbox" value={elem.seriesID} onChange={(e) => onSeriesCheckboxChanged(e.currentTarget.checked, elem.seriesID)} checked={checkedIds.includes(elem.seriesID)}/>
                                {elem.seriesName}
                                {(seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.owner) &&
                                    (seriesInfo[elem.seriesID].data.detail.owner.type == "channel" ?
                                        <span className="stockedseries-row-owner" style={{ fontSize: 12, marginLeft: ".5em" }}>
                                            - {lang.CHANNEL}:
                                            <a href={"https://nico.ms/" + seriesInfo[elem.seriesID].data.detail.owner.channel.id} className="stockedseries-row-ownerlink">{seriesInfo[elem.seriesID].data.detail.owner.channel.name}</a>
                                        </span>
                                        : <span className="stockedseries-row-owner" style={{ fontSize: 12, marginLeft: ".5em" }}>
                                            - {lang.USER}:
                                            <a href={"https://nico.ms/user/" + seriesInfo[elem.seriesID].data.detail.owner.user.id} className="stockedseries-row-ownerlink" style={seriesInfo[elem.seriesID].data.detail.owner.user.isPremium ? { color: "#d9a300" } : {}}>{seriesInfo[elem.seriesID].data.detail.owner.user.nickname}</a>
                                        </span>
                                    )
                                }
                            </div>
                        })}
                    </div>
                    <div className="window-button-container">
                        <button type="button" onClick={() => {setIsFolderCreateWindowVar(false);setFCDefaultSelected([]);setFCEditId(null);}} className="window-button">× {lang.CLOSE}</button>
                        <button type="button" onClick={() => {
                            if ( editFolderObj ) {
                                setFolder(editFolderObj.id, editFolderIndex, {...editFolderObj, name: folderNameInputRef.current.value, idList: checkedIds})
                            } else {
                                addFolder(folderNameInputRef.current.value, checkedIds);
                            }
                            setIsFolderCreateWindowVar(false);
                            setFCDefaultSelected([]);
                            setFCEditId(null)
                        }} className="window-button window-button-primary">{editFolderObj ? lang.SAVE_CHANGE : lang.ADD_FOLDER}</button>
                    </div>
                </div>
            </div>
        </FocusLock>
    </div>
}

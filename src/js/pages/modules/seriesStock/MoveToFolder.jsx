import { useRef } from "react"
import { useSSContext } from "./SSContext"

// SeriesRowから呼び出される、フォルダーへ移動する用のコンポーネント。
// 操作: フォルダーへ移動, フォルダー追加モーダルを開く
export function MoveToFolder(props) {
    const folderSelectRef = useRef(null)
    const { fcDefaultSelected, setFCDefaultSelected, setIsFolderCreateWindowVar, lang, syncStorage, setSyncStorageValue} = useSSContext()
    const seriesId = props.seriesid

    function addToFolder(folderId, seriesId) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
            const index = syncStorage.stockedseries.findIndex(elem => elem.id === folderId)
            if ( syncStorage.stockedseries[index].idList.includes(seriesId) ) return
            const stockArrayCopy = syncStorage.stockedseries.slice()
            stockArrayCopy[index].idList.push(seriesId)
            setSyncStorageValue("stockedseries", stockArrayCopy)
        }
    }
    return <div style={{display: "flex", flexWrap: "wrap", justifyContent: "right"}} className="stockedseries-movecontainer">
        <div className="folderselector-container">
            {lang.FOLDER_MOVE_TO_LABEL}
            <select ref={folderSelectRef}>
                {syncStorage.stockedseries.filter(elem => elem.type == "folder").map(elem => {
                    return <option type="button" className="context-button" value={elem.id}>{elem.name}</option>
                })}
            </select>
        </div>
        <div className="buttons-container">
            <button type="button" onClick={() => {
                addToFolder(folderSelectRef.current.value, seriesId)
                props.onExit()
            }}>{lang.MOVE_TO_SELECTED_FOLDER}</button>
            <button type="button" onClick={() => {
                setFCDefaultSelected([...fcDefaultSelected, seriesId])
                setIsFolderCreateWindowVar(true)
                props.onExit()
            }}>{lang.NEW_FOLDER_OPENMODAL}</button>
            <button type="button" onClick={props.onExit}>{lang.CANCEL}</button>
        </div>
    </div> 
}
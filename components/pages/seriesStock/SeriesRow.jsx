import { useSortable } from "@dnd-kit/sortable"
import { EpisodeList } from "./EpisodeList"
import { CSS } from "@dnd-kit/utilities"
import { useSSContext } from "./SSContext"

import { removeSeriesStock, useSeriesInfo } from "./seriesManage";
import { memo, useState } from "react";

import { linkAction } from "@/utils/actions";
import { MoveToFolder } from "./MoveToFolder";
import { IconChevronDown, IconChevronUp, IconFolderSymlink, IconPlayerPlayFilled, IconPlayerSkipForwardFilled, IconTrash } from "@tabler/icons-react";

// ストックされているシリーズ項目。フォルダーからも呼び出されます。
// 操作: シリーズの削除, フォルダーから除去, 「フォルダーへ移動」(MoveToFolder.jsx)を開く, 詳細を展開
export function SeriesRow(props) {
    const { isUnlocked, lang, syncStorage, setSyncStorageValue } = useSSContext()
    const thisSeries = props.series
    if (thisSeries.type == "folder") {
        return
    }

    const thisSeriesInfo = useSeriesInfo(thisSeries.seriesID)
    const seriesHref = `https://www.nicovideo.jp/series/${thisSeries.seriesID}`
    // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
    // 内容はJSONで、Base64でエンコードします
    const playlist = btoa(`{"type":"series","context":{"seriesId":${thisSeries.seriesID}}}`)
    const titleRegexp = new RegExp(`^${thisSeries.seriesName}( |　)*`)
    const [isDetailedViewExpanded, setDetailedViewExpanded] = useState(false)
    // elem.idはstringである必要があるため、toStringで変換する
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: thisSeries.seriesID.toString(), disabled: !isUnlocked })
    const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
    const [isMoveWindowOpen, setMoveWindowOpen] = useState(false)

    const EpisodeListMemo = memo(EpisodeList)

    function removeSeriesStock(seriesid) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(series => series.seriesID === seriesid) != -1) {
            const newStock = syncStorage.stockedseries.filter(obj => obj.seriesID !== seriesid);
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

    return <div className="stockedseries-row" key={thisSeries.seriesID} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
        <div className={isDetailedViewExpanded ? "stockedseries-desc-container detailedviewexpanded" : "stockedseries-desc-container"}>
            <div className="serieslink-container">
                {(thisSeriesInfo && thisSeriesInfo.data && thisSeriesInfo.data.detail && thisSeriesInfo.data.detail.thumbnailUrl) && 
                    <img src={thisSeriesInfo.data.detail.thumbnailUrl} title={thisSeriesInfo.data.detail.title + lang.THUMB_ALT_TEXT} className="stockedseries-row-thumbnail" />
                }
                <div className="seriesinfo-container">
                    <a className="stockedseries-row-link" href={seriesHref} target="_blank">
                        {thisSeries.seriesName}
                        {isUnlocked && <span style={{ fontSize: 12, color: "var(--textcolor2)", fontWeight: "normal", marginLeft: 4}}> (ID: {thisSeries.seriesID})</span>}
                    </a>
                    { !isMoveWindowOpen && 
                        <>{props.isfolder ? <button className="stockedseries-row-actionbutton" onClick={() => {removeFromFolder(props.folderid, props.folderindex, thisSeries.seriesID)}}>{lang.REMOVE_FROM_FOLDER}</button> : 
                        <button className="stockedseries-row-actionbutton" onClick={() => {setMoveWindowOpen(!isMoveWindowOpen)}} title={lang.MOVE_TO_FOLDER}><IconFolderSymlink /></button>}
                        <button className="stockedseries-row-actionbutton" onClick={() => {removeSeriesStock(thisSeries.seriesID)}} title={lang.REMOVE_FROM_STOCK}><IconTrash /></button></>
                    }
                    {(thisSeriesInfo && thisSeriesInfo.data && thisSeriesInfo.data.detail && thisSeriesInfo.data.detail.owner) &&
                        (thisSeriesInfo.data.detail.owner.type == "channel" ?
                            <div className="stockedseries-row-owner">
                                {lang.CHANNEL}:
                                { thisSeriesInfo.data.detail.owner.channel ? 
                                    <a href={"https://nico.ms/" + thisSeriesInfo.data.detail.owner.channel.id} className="stockedseries-row-ownerlink">{thisSeriesInfo.data.detail.owner.channel.name}</a>
                                    : <span>{lang.UNKNOWN_CHANNEL}</span>
                                }               
                            </div>
                            : <div className="stockedseries-row-owner">
                                {lang.USER}:
                                { thisSeriesInfo.data.detail.owner.user ? 
                                    <a href={"https://nico.ms/user/" + thisSeriesInfo.data.detail.owner.user.id} className="stockedseries-row-ownerlink" style={thisSeriesInfo.data.detail.owner.user.isPremium ? { color: "#d9a300" } : {}}>{thisSeriesInfo.data.detail.owner.user.nickname}</a>
                                    : <span>{lang.UNKNOWN_USER}</span>
                                }
                            </div>
                        )
                    }
                </div>
            </div>
            { isMoveWindowOpen && <MoveToFolder seriesid={thisSeries.seriesID} onExit={() => {setMoveWindowOpen(false)}}/>}
            <div className="stockedseries-vidlink-container">
                {thisSeries.lastVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${thisSeries.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${thisSeries.seriesID}`}><IconPlayerPlayFilled />{lang.LASTVID_TITLE}<span>{thisSeries.lastVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><IconPlayerPlayFilled />{lang.LASTVID_TITLE}<span>{lang.NO_TRACKED_VIDEO}</span></a>}
                {thisSeries.nextVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => { linkAction(e) }} href={`https://www.nicovideo.jp/watch/${thisSeries.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${thisSeries.seriesID}`}><IconPlayerSkipForwardFilled />{lang.NEXTVID_TITLE}<span>{thisSeries.nextVidName.replace(titleRegexp, "")}</span></a> : <a style={{ color: "var(--textcolor3)" }} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><IconPlayerSkipForwardFilled />{lang.NEXTVID_TITLE}<span>{lang.NO_TRACKED_VIDEO}</span></a>}
            </div>
            {isDetailedViewExpanded && <EpisodeListMemo seriesinfo={thisSeriesInfo}/>}
            <button type="button" className="expanddetailedview" onClick={() => { setDetailedViewExpanded(!isDetailedViewExpanded) }}>
                {(thisSeriesInfo) ? (isDetailedViewExpanded ? <><IconChevronUp/>{lang.HIDE_DETAILS}<IconChevronUp/></> : <><IconChevronDown/>{lang.SEE_DETAILS}<IconChevronDown/></>) : <><IconChevronDown/><span style={{ color: "var(--textcolor2)" }}>{lang.LOADING}</span><IconChevronDown/></>}
            </button>
        </div>
    </div>
}
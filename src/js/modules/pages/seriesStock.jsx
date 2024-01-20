import React, { useEffect, useState, memo, Suspense } from "react";
import { getSyncStorageData } from "../storageControl";
import { linkAction } from "../actions";
import lang from "../../../langs/ja.json";

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

function CreateSeriesStockBlock() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    const [ seriesInfo, setSeriesInfoVar ] = useState({})
    const [ isUnlocked, setIsUnlockedVar ] = useState(false)
    const [ isLoaded, setIsLoaded ] = useState(false)
    const StockRowMemo = memo((props) => <SeriesStockRow storage={props.storage} seriesinfo={props.seriesinfo}/>)
    useEffect(() => {
        console.log("useEffect called")
        function getSeriesInfo(id){
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
            if ( storage.stockedseries ) {
                const infoArray = await Promise.allSettled(storage.stockedseries.map(async elem => { 
                    return await getSeriesInfo(elem.seriesID)
                }))
                infoArray.map(elem => {
                    if ( elem.status == "fulfilled" && elem.value ) {
                        const res = elem.value
                        if ( res.meta && res.meta.status == 200 && res.data && res.data.detail && res.data.detail.id ) {
                            seriesInfoObj[res.data.detail.id] = res
                        }
                    }
                })
            }
            setSeriesInfoVar(seriesInfoObj)
            setIsLoaded(true)
        }
        getData()
    }, [])
    function SeriesStockRow(props) {
        const storage = props.storage
        const seriesInfo = props.seriesinfo
        console.log("Render called")
        if ( storage.stockedseries ) {
            const rowList = []
            for ( const elem of storage.stockedseries ) {
                let seriesHref = `https://www.nicovideo.jp/series/${elem.seriesID}`
                // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
                // 内容はJSONで、Base64でエンコードします
                let playlist = btoa(`{"type":"series","context":{"seriesId":${elem.seriesID}}}`)
                //console.log(elem)
                const titleRegexp = new RegExp(`^${elem.seriesName}( |　)*`)
                const [ isDetailedViewExpanded, setDetailedViewExpanded ] = useState(false)
                const EpisodeListElemMemo = memo((props) => {
                    return props.episodeItems.map(thisEp => {
                        return <a key={thisEp.video.id} className="detailedview-episoderow" onClick={(e) => {linkAction(e)}} href={`https://www.nicovideo.jp/watch/${thisEp.video.id}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}>
                            {thisEp.video.thumbnail.middleUrl && <img src={thisEp.video.thumbnail.middleUrl} className="episoderow-thumbnail"/>}
                            <div className="episoderow-infocontainer">
                                <span className="episoderow-info-title">{thisEp.video.title}</span>
                                <span className="episoderow-info-date">{new Date(thisEp.video.registeredAt).toLocaleString()}</span>
                            </div>
                        </a>
                    })
                })
                rowList.push(<div className="stockedseries-row" key={elem.seriesID}>
                    <div className={ isDetailedViewExpanded ? "stockedseries-desc-container detailedviewexpanded" : "stockedseries-desc-container"}>
                        <div className="serieslink-container">
                            { ( isLoaded && seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.thumbnailUrl) && <img src={seriesInfo[elem.seriesID].data.detail.thumbnailUrl} title={seriesInfo[elem.seriesID].data.detail.title + "のサムネイル"} className="stockedseries-row-thumbnail"/>}
                            <div className="seriesinfo-container">
                                <a className="stockedseries-row-link" href={seriesHref} target="_blank">{elem.seriesName}</a>
                                <button className="removeseries"><DeleteOutlined/></button>
                                { ( isLoaded && seriesInfo[elem.seriesID] && seriesInfo[elem.seriesID].data && seriesInfo[elem.seriesID].data.detail && seriesInfo[elem.seriesID].data.detail.owner) && 
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
                            { elem.lastVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => {linkAction(e)}} href={`https://www.nicovideo.jp/watch/${elem.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><PlayArrowOutlinedIcon/>最後に見た動画<span>{elem.lastVidName.replace(titleRegexp, "")}</span></a> : <a style={{color: "var(--textcolor3)"}} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><PlayArrowOutlinedIcon/>最後に見た動画<span>まだ保存されていません</span></a> }
                            { elem.nextVidID ? <a className="stockedseries-row-link stockedseries-row-vidlink" onClick={(e) => {linkAction(e)}} href={`https://www.nicovideo.jp/watch/${elem.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${elem.seriesID}`}><SkipNextOutlinedIcon/>次の動画<span>{elem.nextVidName.replace(titleRegexp, "")}</span></a> : <a style={{color: "var(--textcolor3)"}} className="stockedseries-row-link stockedseries-row-vidlink vidlinkdisabled"><SkipNextOutlinedIcon/>次の動画<span>まだ保存されていません</span></a> }
                        </div>
                        { ( isLoaded && seriesInfo[elem.seriesID]) && (seriesInfo[elem.seriesID].data.items ? <div className="episodelist-container" style={{"--maxheight": `${seriesInfo[elem.seriesID].data.items.length * 4.0}em`}}><span fallback={<div>ロード中...</div>}><EpisodeListElemMemo episodeItems={seriesInfo[elem.seriesID].data.items}/></span></div> : <div className="episodelist-container" style={{"--maxheight": `4em`}}>シリーズにエピソード情報がありません。</div>)}
                        { ( isLoaded && seriesInfo[elem.seriesID]) && <button type="button" className="expanddetailedview" onClick={() => { setDetailedViewExpanded(!isDetailedViewExpanded)}}>{ isDetailedViewExpanded ? <><ExpandLessOutlinedIcon/>詳細を隠す<ExpandLessOutlinedIcon/></> : <><ExpandMoreOutlinedIcon/>詳細を表示<ExpandMoreOutlinedIcon/></> }</button>}
                    </div>
                </div>)
            }
            //console.log(rowList)
            return <>{rowList}</>
        } else {
            return <span>ストック中のシリーズが一つもありません。</span>
        }
    }

    return <div className="seriesstock-block">
        <h2 className="seriesstocktitle">{`シリーズストック (${(syncStorage.stockedseries ?? []).length})`}<button className="togglelock" title={ isUnlocked ? "ロック状態に変更" : "ロック解除" } type="button" onClick={() => { setIsUnlockedVar(!isUnlocked) }}>{ isUnlocked ? <LockOpenOutlined style={{ fontSize: 22 }}/> : <LockOutlinedIcon style={{ fontSize: 22 }}/>}</button></h2>
        <div className={"stockedserieslist-container" + " " + ( isUnlocked ? "stocklist-unlocked" : "" )}>
            <StockRowMemo storage={syncStorage} seriesinfo={seriesInfo}/>
        </div>
    </div>
}


export default CreateSeriesStockBlock;
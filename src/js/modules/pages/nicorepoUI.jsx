import React, { useState,useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import DOMPurify from "dompurify";
import { linkAction } from "../actions";
import "../../../style/pages/nicorepoUI.styl"
import lang from "../../../langs/ja.json";

import RefreshIcon from '@mui/icons-material/Refresh';

const getRecentNicorepo = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "getRecentNicorepo" }, resolve))

function CreateNicorepoUI() {
    const [ nicorepoInfo, setNicorepoInfoVar ] = useState({})
    const [ reloadRenderVar, setReloadRenderVar ] = useState(false)
    useEffect(() => {
        getRecentNicorepo.then((res) => {
            setNicorepoInfoVar(res)
        })
    }, [])
    function reloadNicorepo() {
        const getUpdatedNicorepo = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "getRecentNicorepo", "updateType": 1 }, resolve))
        getUpdatedNicorepo.then((res) => {
            setNicorepoInfoVar(res)
            setReloadRenderVar(!reloadRenderVar)
        })
    }
    if ( nicorepoInfo != undefined && nicorepoInfo.meta != undefined && nicorepoInfo.meta.status == 200 && nicorepoInfo.data ) {
        const fetchdate = new Date(nicorepoInfo.fetchdate)
        const itemDispArray = nicorepoInfo.data.map(elem => {
            return <div className="nicorepo-rowcontainer" key={elem.id}>
                {(elem.actor && elem.actor.icon && elem.actor.url) && <a href={elem.actor.url} onClick={(e) => {linkAction(e)}}><img className="nicorepo-userimg" src={elem.actor.icon}/></a>}
                {(elem.object && elem.object.image) && <img className="nicorepo-itemimg" src={elem.object.image}/>}
                <div className="nicorepo-rowlinkcontainer">
                    {(elem.actor && elem.actor.name && elem.actor.url) && <a className="nicorepo-rowlink" href={elem.actor.url} onClick={(e) => {linkAction(e)}}>{elem.actor.name}</a>}
                    {elem.title && <div className="nicorepo-rowlink">{HTMLReactParser(DOMPurify.sanitize(elem.title))}</div>}
                    {(elem.object && elem.object.name && elem.object.url) && <a href={elem.object.url} onClick={(e) => {linkAction(e)}}>{elem.object.name}</a>}
                </div>
            </div>
        })

        return <>
            <div className="nicorepo-lastfetch">最終取得: {fetchdate.toLocaleString()}<button className="nicorepo-reload" onClick={() => {reloadNicorepo()}} type="button"><RefreshIcon style={{ fontSize: 18 }}/></button></div>
            <div className="nicorepo-rowlistcontainer">
                { itemDispArray }
            </div>
        </>
    } else if ( nicorepoInfo == {} ) {
        return <div>ロード中</div>
    } else {
        return <>
            <div>ニコレポ情報の取得に失敗しました{(nicorepoInfo.meta != undefined && nicorepoInfo.meta.status != undefined ) ?? ": " + nicorepoInfo.meta.status}</div>
            <button className="nicorepo-reload" onClick={() => {reloadNicorepo()}} type="button"><RefreshIcon/></button>
        </>
    }
    
}

export default CreateNicorepoUI;
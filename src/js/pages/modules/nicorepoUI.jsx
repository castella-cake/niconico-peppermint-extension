import { useState,useEffect } from "react";
import HTMLReactParser from "html-react-parser";
import DOMPurify from "dompurify";
import { linkAction } from "../../modules/actions";
import "../../../style/pages/nicorepoUI.styl"

import { MdOutlineRefresh } from "react-icons/md";
import { useLang } from "./localizeHook";

const getRecentNicorepo = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "getRecentNicorepo" }, resolve))

function CreateNicorepoUI(props) {
    const displayLimit = (props.displaylimit ? props.displaylimit : 500)
    const [ nicorepoInfo, setNicorepoInfoVar ] = useState({})
    const [ reloadRenderVar, setReloadRenderVar ] = useState(false)
    const lang = useLang()
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
        const itemDispArray = nicorepoInfo.data.slice(0, displayLimit).map(elem => {
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

        return <div className="block-container">
            { props.isrecentblock && <h2 className="block-title">{lang.DASHBOARD_TITLES.nicorepo}</h2> }
            <div className="nicorepo-lastfetch">{lang.LAST_FETCHED_DATE}: {fetchdate.toLocaleString()}<button className="nicorepo-reload" onClick={() => {reloadNicorepo()}} type="button"><MdOutlineRefresh style={{ fontSize: 18 }}/></button></div>
            <div className="nicorepo-rowlistcontainer">
                { itemDispArray }
            </div>
        </div>
    } else if ( nicorepoInfo == {} ) {
        return <div className="block-container">
            { props.isrecentblock && <h2 className="block-title">{lang.DASHBOARD_TITLES.nicorepo}</h2> }
            {lang.LOADING}
        </div>
    } else {
        return <div className="block-container">
            { props.isrecentblock && <h2 className="block-title">{lang.DASHBOARD_TITLES.nicorepo}</h2> }
            <div>{lang.NICOREPO_FETCH_FAILED}{(nicorepoInfo != undefined && nicorepoInfo.meta != undefined && nicorepoInfo.meta.status != undefined ) && ": " + nicorepoInfo.meta.status}<button className="nicorepo-reload" onClick={() => {reloadNicorepo()}} type="button"><MdOutlineRefresh/></button></div>
        </div>
    }
    
}

export default CreateNicorepoUI;
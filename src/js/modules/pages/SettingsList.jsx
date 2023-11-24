import React, { useEffect, useState } from "react";
import { getSyncStorageData } from "../storageControl";

const settings = {
    hide: [
        {
            type: "checkbox",
            name: "hiderankpagead",
        },
        {
            type: "checkbox",
            name: "hideeventbanner",
        },
        {
            type: "checkbox",
            name: "hidepopup",
        },
        {
            type: "select",
            name: "hidesupporterbutton",
            values: ["", "watch", "all"],
        },
        {
            type: "select",
            name: "hidemetadata",
            values: ["", "watch", "searchandhome", "all"],
        },
    ],
    watchpage: [
        {
            type: "select",
            name: "playertheme",
            values: ["", "harazyuku", "rc1", "rc1plus", "ginza", "mint"],
        },
        {
            type: "select",
            name: "playerstyleoverride",
            values: ["", "harazyuku", "rc1", "rc1dark", "ginza", "mint", "none"],
        },
        {
            type: "select",
            name: "playerstyleoverride",
            values: ["", "harazyuku", "rc1", "rc1dark", "ginza", "mint", "none"],
        },
        {
            type: "input_number",
            name: "commentrow",
            min: 1,
            max: 32,
        },
        {
            type: "select",
            name: "replacemarqueecontent",
            values: ["", "ranking", "blank"],
        },
        {
            type: "checkbox",
            name: "highlightlockedtag",
        },
        {
            type: "checkbox",
            name: "cleanvidowner",
        },
        {
            type: "checkbox",
            name: "shortcutassist",
            children: [{
                type: "checkbox",
                name: "excommander"
            }]
        },
        {
            type: "checkbox",
            name: "usetheaterui",
            children: [{
                type: "checkbox",
                name: "disabletheaterpalette"
            }]
        },
        {
            type: "checkbox",
            name: "enablenicoboxui",
        },
        {
            type: "checkbox",
            name: "usenicoboxui",
            children: [{
                type: "checkbox",
                name: "useoldnicoboxstyle"
            }]
        },
        {
            type: "checkbox",
            name: "quickvidarticle",
        },
        {
            type: "checkbox",
            name: "enablemisskeyshare",
            settinglink: {
                name: "MISSKEYSHARE_CONFIGURE_LINK",
                href: "setmkinstance.html"
            }
        },
    ],
    nicopedia: [
        {
            type: "select",
            name: "hidereputation",
            values: ["", "dislikeonly", "all"],
        },
        {
            type: "checkbox",
            name: "liketonicoru",
        },
        {
            type: "checkbox",
            name: "dicfullwidth",
            children: [
                {
                    type: "select",
                    values: ["", "auto", "100"]
                }
            ]
        },
        {
            type: "checkbox",
            name: "dicsidebartoleft",
        },
        {
            type: "checkbox",
            name: "dicbettereditor",
        },
        {
            type: "checkbox",
            name: "diccontextsearch",
        },
    ],
}

function createSettingsRow(settings) {
    if ( settings.type == "checkbox" ) {
        return <div className="settings-row" index={settings.name}><label><input type="checkbox" />{settings.name}</label></div>
    } else if ( settings.type == "select" ){
        return <div className="settings-row" index={settings.name}><label>{settings.name}<select>{ settings.values.map((elem) => { return <option value={elem}>{elem}</option> })}</select></label></div>
    } else if ( settings.type == "input_number" ) {
        return <div className="settings-row" index={settings.name}><label><input type="number" min={settings.min} max={settings.max} />{settings.name}</label></div>
    } else {
        return <div className="settings-row" index={settings.name}>Unknown settings type</div>
    }
}

function CreateSettingsList() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    const [ settingsElem, setSettingsElemVar ] = useState({})
    useEffect(() => {
        console.log("useEffect called")
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])
    const elemArray = Object.keys(settings).map((elem) => {
        const settingsAreaElems = settings[elem].map((settingsElem) => {
            console.log(settingsElem)
            return createSettingsRow(settingsElem)
        })
        return <div className="settings-area" index={elem}><h1>{elem}</h1>{settingsAreaElems}</div>
    })
    console.log(elemArray)
    return <>{ elemArray }</>
}


export default CreateSettingsList;
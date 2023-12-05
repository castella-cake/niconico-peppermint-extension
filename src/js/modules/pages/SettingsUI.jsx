import React, { useEffect, useState } from "react";
import { getSyncStorageData } from "../storageControl";
import settings from "./settingsList";
import lang from "../../../langs/ja.json";

function CreateSettingsList() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    const [ settingsElem, setSettingsElemVar ] = useState({})
    function setSyncStorageValue(name, value) {
        setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }
    function createSettingsControl(settings) {
        //console.log(lang.SETTINGS_ITEMS[settings.name].name)
        if ( settings.type == "checkbox" ) {
            return <label index={settings.name}><input type="checkbox" checked={syncStorage[settings.name]} onChange={(e) => {setSyncStorageValue(settings.name, e.target.checked)}} />{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label>
        } else if ( settings.type == "select" ){
            const settingsOption = settings.values.map((elem, index) => { return <option value={elem} selected={elem == ( syncStorage[settings.name] ?? settings.default )}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</option> })
            return <label index={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<select onChange={(e) => {setSyncStorageValue(settings.name, e.target.value)}}>{ settingsOption }</select></label>
        } else if ( settings.type == "inputNumber" ) {
            return <label index={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="number" min={settings.min} max={settings.max} value={(syncStorage[settings.name] ?? settings.default)} onChange={(e) => {setSyncStorageValue(settings.name, e.target.value)}}/></label>
        } else if ( settings.type == "inputString" ) {
            //console.log(syncStorage[settings.name])
            return <label index={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="text" value={(syncStorage[settings.name] ?? settings.default)} placeholder={lang.SETTINGS_ITEMS[settings.name].placeholder ?? (settings.placeholder ?? null)} onChange={(e) => {setSyncStorageValue(settings.name, e.target.value)}}/></label>
        } else {
            return <label index={settings.name}>Unknown settings type</label>
        }
    }
    function createSettingsRow(settings) {
        console.log(syncStorage[settings.name])
        let elemList = []
        elemList.push(createSettingsControl(settings))
        if ( settings.children ) {
            console.log(settings.children)
            const childrenSettingsElemList = settings.children.map((elem) => {
                return createSettingsControl(elem)
            })
            console.log(childrenSettingsElemList)
            elemList = elemList.concat(childrenSettingsElemList)
        }
        let linkElem
        if ( settings.settingLink ) {
            linkElem = <a target="_self" className="settinglink" href={settings.settingLink.href}>{lang[settings.settingLink.name] ?? settings.settingLink.name}</a>
        }
        let hintElem
        if ( lang.SETTINGS_ITEMS[settings.name].hint && lang.SETTINGS_ITEMS[settings.name].hint !== "" ) {
            hintElem = <div className="hint">{lang.SETTINGS_ITEMS[settings.name].hint ?? ""}</div>
        }
        return <div className="settings-row" index={`${settings.name}-row`}>{ elemList }{ hintElem }{ linkElem }</div>
    }
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
        return <div className="settings-area" index={elem}><h1>{lang.SETTINGS_AREATITLE[elem] ?? elem}</h1>{settingsAreaElems}</div>
    })
    console.log(elemArray)
    return <>{ elemArray }</>
}


export default CreateSettingsList;
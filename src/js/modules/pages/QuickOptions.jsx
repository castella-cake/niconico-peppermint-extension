import React, { useEffect, useState } from "react";
import { getSyncStorageData } from "../storageControl";
import settings from "./settingsList";
import lang from "../../../langs/ja.json";
import "../../../style/pages/settingsUI.styl"

function CreateQuickOption() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
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
            return <label key={settings.name}><input type="checkbox" checked={syncStorage[settings.name] ?? settings.default} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.checked)}} />{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label>
        } else if ( settings.type == "select" ){
            const settingsOption = settings.values.map((elem, index) => { return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</option> })
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<select onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}} value={syncStorage[settings.name] ?? settings.default}>{ settingsOption }</select></label>
        } else if ( settings.type == "selectButtons" ){
            const settingsOption = settings.values.map((elem, index) => { return <button type="button" key={elem} onClick={() => {setSyncStorageValue(settings.name, elem)}} className={"select-button" + ((syncStorage[settings.name] ?? settings.default) == elem ? " select-button-current" : "")}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</button> })
            return <><label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label><div className="select-button-container" key={`${settings.name}-selectbutton`}>{ settingsOption }</div></>
        } else if ( settings.type == "inputNumber" ) {
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="number" min={settings.min} max={settings.max} value={(syncStorage[settings.name] ?? settings.default)} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}}/></label>
        } else if ( settings.type == "inputString" ) {
            //console.log(syncStorage[settings.name])
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="text" value={(syncStorage[settings.name] ?? settings.default)} placeholder={lang.SETTINGS_ITEMS[settings.name].placeholder ?? (settings.placeholder ?? null)} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}}/></label>
        } else {
            return <label key={settings.name}>Unknown settings type</label>
        }
    }
    function createSettingsRow(settings) {
        //console.log(syncStorage[settings.name])
        let elemList = []
        elemList.push(createSettingsControl(settings))
        return <div className="settings-row settings-row-qo" key={`${settings.name}-row`}>{ elemList }</div>
    }
    useEffect(() => {
        console.log("useEffect called")
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])
    const settingsFilter = ["darkmode", "watchpagetheme", "playertheme"]
    const elemArray = []
    Object.keys(settings).map((elem) => {
        settings[elem].map((settingsElem) => {
            //console.log(settingsElem)
            if (settingsFilter.includes(settingsElem.name)) {
                elemArray.push(createSettingsRow(settingsElem))
            }
        })
    })
    //console.log(elemArray)
    return <div className="block-container">
    <h2 className="block-title">クイック設定<a href="settings.html" target="_self" style={{ "marginLeft": "1rem" }}>設定ページを開く</a></h2>
    { elemArray }
    </div>
}


export default CreateQuickOption;
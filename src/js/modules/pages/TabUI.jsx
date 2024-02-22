import React, { useState, useEffect } from "react";
import { getSyncStorageData } from "../storageControl";
import CreateSettingsList from "./SettingsUI";
import CreateNicorepoUI from "./nicorepoUI";
import CreateSeriesStockBlock from "./seriesStock";
import lang from "../../../langs/ja.json";
import settings from "./settingsList";
import CreateDashboardUI from "./dashboardUI";

import { MdOutlineEdit, MdOutlineEditOff } from "react-icons/md"
// #region Enum
const tabType = Object.freeze({
    dashboard: 0,
    settings: 1,
    nicorepo: 2,
    notification: 3,
    seriesstock: 4,
})
// #endregion

function createTabUI() {
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
    useEffect(() => {
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])

    const [isEditMode, setIsEditMode] = useState(false)
    const [currentTab, setCurrentTab] = useState(tabType.dashboard)

    let currentTabElem = <div>Invalid tab type.</div>;
    if ( currentTab == tabType.dashboard ) {
        currentTabElem = <>
            <CreateDashboardUI />
        </>
    } else if ( currentTab == tabType.settings ) {
        currentTabElem = <>
            <CreateSettingsList />
        </>
    } else if ( currentTab == tabType.nicorepo) {
        currentTabElem = <>
            <CreateNicorepoUI />
        </>
    } else if ( currentTab == tabType.seriesstock) {
        currentTabElem = <>
            <CreateSeriesStockBlock />
        </>
    }

    function TabEditCheckbox(props) {
        console.log(props)
        const setting = props.setting
        if (!isEditMode) {
            return
        }
        return <label><input type="checkbox" checked={syncStorage[setting.name] ?? setting.default} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.checked)}} />{props.label}</label>
    }
    console.log(settings.quickpanel.enablequicksettingstab)
    // TODO: この地獄みたいなコードをどうにかする
    return <div className="quickpanel-container">
        <div className="tabcontainer">
            <button type="button" className={currentTab == tabType.dashboard || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.dashboard) }) : (() => {})}>{lang.DASHBOARD}</button>
            { (syncStorage.enablenicorepotab || isEditMode) && <button type="button" className={currentTab == tabType.nicorepo || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.nicorepo) }) : (() => {})}>{ isEditMode ? <TabEditCheckbox setting={settings.quickpanel[1]} label={lang.NICOREPO}/> : lang.NICOREPO }</button> }
            { ((syncStorage.enableseriesstocktab || isEditMode) && syncStorage.enableseriesstock) && <button type="button" className={currentTab == tabType.seriesstock || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.seriesstock) }) : (() => {})}>{ isEditMode ? <TabEditCheckbox setting={settings.quickpanel[0]} label={lang.SERIES_STOCK_TITLE}/> : lang.SERIES_STOCK_TITLE }</button> }
            { (syncStorage.enablequicksettingstab || isEditMode) && <button type="button" className={currentTab == tabType.settings || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.settings) }) : (() => {})}>{ isEditMode ? <TabEditCheckbox setting={settings.quickpanel[2]} label={lang.QUICK_SETTINGS}/> : lang.QUICK_SETTINGS }</button> }
            <button type="button" className="tab-editbutton" title="クイックパネルタブをカスタマイズ" onClick={() => {setIsEditMode(!isEditMode); setCurrentTab(tabType.dashboard)}}>{ isEditMode ? <MdOutlineEditOff style={{fontSize: 18}}/> : <MdOutlineEdit style={{fontSize: 18}}/> }</button>
        </div>
        <div className="quickpanel-mainpanel maincontainer">
            <div className="tabpanel current-tabpanel" style={isEditMode ? {background: "var(--bgcolor2)"} : {}}>
                { isEditMode ? <div style={{ fontSize: 14 }}>クイックパネル内タブを編集中です。<br/>表示するタブのチェックボックスをオンにして有効化します。</div> :  currentTabElem }
            </div>
        </div>
    </div>
}

export default createTabUI;
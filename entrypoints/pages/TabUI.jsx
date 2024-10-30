import { useState } from "react";
import CreateSettingsList from "./SettingsUI";
import CreateSeriesStockBlock from "./seriesStock";
import settings from "./settingsList";
import CreateDashboardUI from "./dashboardUI";

import { MdOutlineEdit, MdOutlineEditOff } from "react-icons/md"
import { useManifestData, useStorageContext } from "./extensionHook";
import { useLang } from "./localizeHook";
// #region Enum
const tabType = Object.freeze({
    dashboard: 0,
    settings: 1,
    nicorepo: 2,
    notification: 3,
    seriesstock: 4,
})
// #endregion

function TabEditCheckbox(props) {
    const { syncStorage, setSyncStorageValue } = useStorageContext()
    console.log(props)
    const setting = props.setting
    if (!setting) {
        return
    }
    return <label><input type="checkbox" checked={syncStorage[setting.name] ?? setting.default} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.checked)}} />{props.label}</label>
}

function createTabUI() {
    const lang = useLang()
    const manifestData = useManifestData()
    const { syncStorage, setSyncStorageValue, localStorage, setLocalStorageValue, isLoaded } = useStorageContext()
    if (syncStorage.skipquickpanel === true) {
        location.href = "settings.html"
    }
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentTab, setCurrentTab] = useState(tabType.dashboard)

    let currentTabElem = <div>Invalid tab type.</div>;
    if (currentTab == tabType.dashboard) {
        currentTabElem = <CreateDashboardUI />;
    } else if (currentTab == tabType.settings) {
        currentTabElem = <CreateSettingsList />;
    } else if (currentTab == tabType.nicorepo) {
        currentTabElem =  null;
    } else if (currentTab == tabType.seriesstock) {
        currentTabElem = <CreateSeriesStockBlock />;
    }
    return <div className="quickpanel-container">
        {localStorage.versionupdated && <div className="updatedinfo-container">
            PepperMint+が {manifestData.version_name} にアップデートされました！<br/>
            変更や追加機能は<a href="https://github.com/castella-cake/niconico-peppermint-extension/releases/latest" target="_blank" rel="noopener noreferrer">Releases</a>から確認できます。<br/>
            よければ、開発者を<a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer">Github sponsorsで支援</a>することを検討してください。
            <button type="button" className="updatedinfo-close" onClick={() => {setLocalStorageValue("versionupdated", false)}}>{lang.CLOSE}</button>
        </div>}
        <div className="tabcontainer">
            <button type="button" className={currentTab == tabType.dashboard || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.dashboard) }) : (() => {})}>{lang.DASHBOARD}</button>
            {/*(syncStorage.enablenicorepotab || isEditMode) && <button type="button" className={currentTab == tabType.nicorepo || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.nicorepo) }) : (() => {})}>{isEditMode ? <TabEditCheckbox setting={settings.quickpanel[1]} label={lang.NICOREPO} /> : lang.NICOREPO}</button>*/}
            { ((syncStorage.enableseriesstocktab || isEditMode) && syncStorage.enableseriesstock) && <button type="button" className={currentTab == tabType.seriesstock || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.seriesstock) }) : (() => {})}>{ isEditMode ? <TabEditCheckbox setting={settings.quickpanel[0]} label={lang.SERIES_STOCK_TITLE}/> : lang.SERIES_STOCK_TITLE }</button> }
            { (syncStorage.enablequicksettingstab || isEditMode) && <button type="button" className={currentTab == tabType.settings || isEditMode ? "tabbutton current-tab" : "tabbutton"} onClick={!isEditMode ? (() => { setCurrentTab(tabType.settings) }) : (() => {})}>{ isEditMode ? <TabEditCheckbox setting={settings.quickpanel[1]} label={lang.QUICK_SETTINGS}/> : lang.QUICK_SETTINGS }</button> }
            <button type="button" className="tab-editbutton" title={isEditMode ? lang.QUICKPANEL_TAB_EDITOFF : lang.QUICKPANEL_TAB_EDIT} onClick={() => {setIsEditMode(!isEditMode); setCurrentTab(tabType.dashboard)}}>{ isEditMode ? <MdOutlineEditOff style={{fontSize: 18}}/> : <MdOutlineEdit style={{fontSize: 18}}/> }</button>
        </div>
        <div className="quickpanel-mainpanel maincontainer">
            <div className="tabpanel current-tabpanel" style={isEditMode ? {background: "var(--bgcolor2)"} : {}}>
                { isLoaded && ( isEditMode ? <div style={{ fontSize: 14, padding: 4, whiteSpace: "pre-wrap" }}>{lang.QUICKPANEL_TAB_EDIT_DESC}</div> :  currentTabElem ) }
            </div>
        </div>
    </div>
}

export default createTabUI;
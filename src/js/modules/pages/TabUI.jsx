import React, { useState } from "react";
import CreateSeriesStockBlock from "./seriesStock";
import CreateSettingsList from "./SettingsUI";
import CreateNicorepoUI from "./nicorepoUI";
import lang from "../../../langs/ja.json";

// #region Enum
const tabType = Object.freeze({
    dashboard: 0,
    settings: 1,
    nicorepo: 2,
    notification: 3,
})
// #endregion

function createTabUI() {
    const [currentTab, setCurrentTab] = useState(tabType.dashboard)

    let currentTabElem = <div>Invalid tab type.</div>;
    if ( currentTab == tabType.dashboard ) {
        currentTabElem = <>
            <CreateSeriesStockBlock />
        </>
    } else if ( currentTab == tabType.settings ) {
        currentTabElem = <>
            <CreateSettingsList />
        </>
    } else if ( currentTab == tabType.nicorepo) {
        currentTabElem = <>
            <CreateNicorepoUI />
        </>
    } 
    return <>
        <div className="tabcontainer">
            <button type="button" className={currentTab == tabType.dashboard ? "tabbutton current-tab" : "tabbutton"} onClick={() => { setCurrentTab(tabType.dashboard) }}>{lang.DASHBOARD}</button>
            <button type="button" className={currentTab == tabType.settings ? "tabbutton current-tab" : "tabbutton"} onClick={() => { setCurrentTab(tabType.settings) }}>{lang.QUICK_SETTINGS}</button>
            <button type="button" className={currentTab == tabType.nicorepo ? "tabbutton current-tab" : "tabbutton"} onClick={() => { setCurrentTab(tabType.nicorepo) }}>{lang.NICOREPO}</button>
        </div>
        <div className="quickpanel-mainpanel maincontainer">
            <div className="tabpanel current-tabpanel">
                { currentTabElem }
            </div>
        </div>
    </>
}

export default createTabUI;
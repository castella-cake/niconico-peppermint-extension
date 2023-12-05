import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "./modules/storageControl";
import CreateSettingsList from "./modules/pages/SettingsUI";
import lang from "../langs/ja.json";

function StorageTest() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    useEffect(() => {
        console.log("useEffect called")
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])
    return <div>{ JSON.stringify(syncStorage) }</div>
}


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <div className="container">
        <div className="title-container">
            <div className="title toptitle"><a href="option.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+ の設定</a></div>
            <div className="titlelink-container">
                <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
            </div>
        </div>
        <div className="settings-page-desc">{lang.SETTINGS_DESC}</div>
        { /* <StorageTest/> */ }
        <CreateSettingsList/>
    </div>
    </React.StrictMode>,
);
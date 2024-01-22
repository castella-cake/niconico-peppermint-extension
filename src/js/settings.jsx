import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "./modules/storageControl";
import CreateSettingsList from "./modules/pages/SettingsUI";
import lang from "../langs/ja.json";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <div className="container">
        <div className="title-container">
            <div className="title toptitle"><a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+ の設定</a></div>
            <div className="titlelink-container">
                <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
            </div>
        </div>
        <div className="settings-page-desc">{lang.SETTINGS_DESC}</div>
        <div className="maincontainer">
            <CreateSettingsList/>
        </div>
        <div id="info-area" className="includelinks">
            <div className="hint">
                設定は自動保存されます。保存した設定を反映させるには、リロードする必要があります。<br/>
                PepperMintの更新後に表示が崩れた場合は、Ctrl+Shift+Rでハード再読み込みを試してみてください。
            </div>
            Niconico-PepperMint+ <a href="https://github.com/castella-cake/niconico-peppermint-extension"target="_blank" rel="noopener noreferrer">Github Repo</a><br/>
            Created by CYakigasi <a href="https://www.cyakigasi.net" target="_blank"
                rel="noopener noreferrer">Website</a> <a href="https://twitter.com/CYaki_xcf" target="_blank"
                rel="noopener noreferrer">@CYaki_xcf(更新情報もここから)</a>
            <a href="credit.html" target="_self" className="settinglink">PepperMintについて・データの管理...</a>    
        </div>
    </div>
    </React.StrictMode>,
);
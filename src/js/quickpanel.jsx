import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CreateSeriesStockBlock from "./modules/pages/seriesStock";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <div className="container">
        <div className="title-container">
            <div className="title toptitle"><a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+</a></div>
            <div className="titlelink-container">
                <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
            </div>
        </div>
        <div className="tabcontainer">
            <button type="button" className="current-tab tabbutton">ダッシュボード</button>
        </div>
        <div className="quickpanel-mainpanel maincontainer">
            <div className="tabpanel current-tabpanel">
                <a href="settings.html" target="_self" className="settinglink">クイック設定を開く</a>
                <CreateSeriesStockBlock/>
            </div>
        </div>
        
    </div>
    </React.StrictMode>,
);
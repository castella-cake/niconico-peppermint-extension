import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CreateTabUI from "./modules/pages/TabUI";
import { SyncStorageProvider } from "./modules/pages/extensionHook";

const manifestData = chrome.runtime.getManifest();
const currentVersion = manifestData.version_name;

if (chrome.browserAction != undefined) {
    chrome.browserAction.setBadgeText({ text: "" })
} else if (chrome.action != undefined) {
    chrome.action.setBadgeText({ text: "" })
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
    <SyncStorageProvider>
        <div className="container">
            <div className="title-container">
                <div className="title toptitle">
                    <a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+</a>
                        <span className="current-version" style={currentVersion.includes("DEV") ? {color: "#f00"} : (currentVersion.includes("PRE") ? {color: "#ff0"} : {color: "var(--textcolor2)"})}>
                            v{currentVersion}
                        </span>
                    </div>
                <div className="titlelink-container">
                    <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                    <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
                </div>
            </div>
        </div>
        <CreateTabUI/>
    </SyncStorageProvider>
    </StrictMode>,
);
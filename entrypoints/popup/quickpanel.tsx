import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CreateTabUI from "../pages/TabUI";
import { StorageProvider } from "../pages/extensionHook";
import { ErrorBoundary } from "react-error-boundary";

import "./quickpanel.styl"

const manifestData = browser.runtime.getManifest();
const currentVersion = manifestData.version_name || manifestData.version || "Unknown";

if (browser.browserAction != undefined) {
    browser.browserAction.setBadgeText({ text: "" })
}

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("root element not found");
createRoot(rootElement).render(
    <StrictMode>
    <StorageProvider>
        <div className="container">
            <div className="title-container">
                <div className="title toptitle">
                    <a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+</a>
                        <span className="current-version" style={currentVersion?.includes("DEV") ? {color: "#f00"} : (currentVersion?.includes("PRE") ? {color: "#dd0"} : {color: "var(--textcolor2)"})}>
                            v{currentVersion}
                        </span>
                    </div>
                <div className="titlelink-container">
                    <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                    <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
                </div>
            </div>
        </div>
        <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => {
            return <div style={{ background: "var(--bgcolor3)", color: "var(--textcolor3)", borderRadius: 4 }}>
                クイックパネルの表示中に重大なエラーが発生しました: {error.message}
            </div>
        }}>
            <CreateTabUI/>
        </ErrorBoundary>
    </StorageProvider>
    </StrictMode>,
);
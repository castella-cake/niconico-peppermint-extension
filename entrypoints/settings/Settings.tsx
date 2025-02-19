import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CreateSettingsList from "@/components/pages/SettingsUI";
import lang from "@/langs/ja.json";
import { StorageProvider } from "@/hooks/extensionHook";

import { ErrorBoundary } from "react-error-boundary";

import settings from "@/utils/settingsList";

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("root element not found");
createRoot(rootElement).render(
    <StrictMode>
        <StorageProvider>
            <div className="container">
                <div className="title-container">
                    <div className="title toptitle"><a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+ の設定</a></div>
                    <div className="titlelink-container">
                        <a href="https://discord.com/invite/GNDtKuu5Rb" target="_blank" rel="noopener noreferrer" className="titlelink">Discord</a>
                        <a href="https://github.com/castella-cake/niconico-peppermint-extension/issues" target="_blank" rel="noopener noreferrer" className="titlelink">Feedback</a>
                    </div>
                </div>
                <div className="settings-page-desc">{lang.SETTINGS_DESC}</div>
                <div className="maincontainer">
                    <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => {
                        return <div style={{ background: "var(--bgcolor3)", color: "var(--textcolor3)"}}>
                            表示中に重大なエラーが発生しました: {error.message}
                        </div>
                    }}>
                        <CreateSettingsList settings={settings}/>
                    </ErrorBoundary>
                </div>
                <div className="footer-settings">
                    <a href="credit.html" target="_self" className="settinglink">PepperMintについて...</a>
                    <a href="storagemanage.html" target="_self" className="settinglink">ユーザーデータの管理...</a>
                </div>
                <div id="info-area" className="includelinks">
                    <div className="hint">
                        設定は自動保存されます。保存した設定を反映させるには、リロードする必要があります。<br/>
                        PepperMintの更新後に表示が崩れた場合は、Ctrl+Shift+Rでハード再読み込みを試してみてください。<br/>
                    </div>
                    Niconico-PepperMint+ <a href="https://github.com/castella-cake/niconico-peppermint-extension"target="_blank" rel="noopener noreferrer">Github Repo</a> <a href="https://discord.com/invite/GNDtKuu5Rb" target="_blank" rel="noopener noreferrer" style={{marginRight: 4}}>Discord</a><br/>
                    Created by CYakigasi <a href="https://www.cyakigasi.net" target="_blank" rel="noopener noreferrer" style={{marginRight: 4}}>Website</a>
                    <a href="https://www.nicovideo.jp/user/92343354" target="_blank" rel="noopener noreferrer" style={{marginRight: 4}}>Niconico</a>
                    <a href="https://www.cyakigasi.net/links" target="_blank" rel="noopener noreferrer" style={{marginRight: 4}}>SNS Links(Misskey,Bluesky,Twitter...)</a> <br/>
                    <div className="flavortext">視聴ページを再構築する拡張機能。よければ <a href="https://github.com/castella-cake/mintwatch" target="_blank" rel="noopener noreferrer">MintWatch(Beta)</a> もご一緒にどうぞ…</div>
                </div>
            </div>
        </StorageProvider>
    </StrictMode>,
);
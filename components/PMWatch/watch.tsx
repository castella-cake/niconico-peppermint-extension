import { StrictMode } from "react";

import CreateWatchUI from "./WatchUI";
import PluginList from "./modules/PluginList";

//import "./index.styl"
import { ErrorBoundary } from "react-error-boundary";
import { StorageProvider } from "@/hooks/extensionHook";
import { IconBoom } from "@tabler/icons-react";

export function watchPage() {
    return <StrictMode>
        <StorageProvider>
            <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => {
                return <div className="pmwatch-error-boundary-wrapper">
                    <div className="pmwatch-error-boundary-container">
                        <h1><IconBoom/> Aw, snap!</h1>
                        <p>MintWatchの表示中に重大なエラーが発生しました。</p>
                        <p className="pmwatch-error-boundary-msg"><code>{error.message}</code></p>
                        <p className="pmwatch-error-boundary-button-container">
                            <a href="https://www.nicovideo.jp/video_top">ニコニコ動画へ戻る</a>
                            <button onClick={resetErrorBoundary}>再読み込み</button>
                        </p>
                    </div>
                </div>
            }}>
                <CreateWatchUI/>
                <PluginList/>
            </ErrorBoundary>
        </StorageProvider>
    </StrictMode>
}
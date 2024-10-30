import { StrictMode } from "react";
import { StorageProvider } from "../pages/extensionHook";

import CreateWatchUI from "./watchUI";
import PluginList from "./modules/PluginList";

import "./index.styl"
import { ErrorBoundary } from "react-error-boundary";

export function watchPage() {
    return <StrictMode>
        <StorageProvider>
            <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => {
                return <div style={{ background: "var(--bgcolor1)", color: "var(--textcolor1)", borderRadius: 4     }}>
                    <h1>Aw, snap!</h1>
                    <p>MintWatchの表示中に重大なエラーが発生しました。</p>
                    <p><code>{error.message}</code></p>
                </div>
            }}>
                <CreateWatchUI/>
                <PluginList/>
            </ErrorBoundary>
        </StorageProvider>
    </StrictMode>
}
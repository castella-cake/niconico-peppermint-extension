import { StrictMode } from "react";

import CreateWatchUI from "./watchUI";
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
                    </div>
                </div>
            }}>
                <CreateWatchUI/>
                <PluginList/>
            </ErrorBoundary>
        </StorageProvider>
    </StrictMode>
}
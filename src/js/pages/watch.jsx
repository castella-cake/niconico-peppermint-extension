import { StrictMode } from "react";
import lang from "../../langs/ja.json";
import { StorageProvider } from "./modules/extensionHook";

import { ErrorBoundary } from "react-error-boundary";
import { useEffect } from "react";
import CreateWatchUI from "./modules/watchUI";
import PluginList from "./modules/watch/PluginList";


export function watchPage() {
    return <StrictMode>
        <StorageProvider>
            <CreateWatchUI/>
            <PluginList/>
        </StorageProvider>
    </StrictMode>
}
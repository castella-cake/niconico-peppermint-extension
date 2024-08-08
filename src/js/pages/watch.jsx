import { StrictMode } from "react";
import lang from "../../langs/ja.json";
import { StorageProvider } from "./modules/extensionHook";

import { ErrorBoundary } from "react-error-boundary";


export function watchPage() {
    return <StrictMode>
        <StorageProvider>
            <div className="container">
                <div>Welcome to the watch page!!!!!!!!!!</div>
            </div>
        </StorageProvider>
    </StrictMode>
}
import { getLocalStorageData, getSyncStorageData } from "./modules/storageControl";
import { createRoot } from "react-dom/client";
import { watchPage } from "./pages/watch";

const storagePromises = [getSyncStorageData, getLocalStorageData]

Promise.allSettled(storagePromises).then(createCSSRule, onError);
function onError(error: Error) {
    console.log(`Error: ${error}`);
}
function createCSSRule(storages: PromiseFulfilledResult<{[key: string]: string[]}>[]) {
    const syncStorage = storages[0].value
    const localStorage = storages[1].value
    if ( !syncStorage.enablewatchpagereplace ) return
    const queryString = location.search
    const searchParams = new URLSearchParams(queryString)
    if ( searchParams.get("nopmw") == "true" ) return
    window.stop()
    if (!document.documentElement) return
    document.documentElement.innerHTML = "<head><meta charset=\"utf-8\"></head><body><div id=\"ads-130\"></div></body>"
    const head = document.head
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', chrome.runtime.getURL("style/watchUI.css"))
    head.appendChild(link)
    const body = document.body
    const root = document.createElement("div")
    root.id = "root"
    body.appendChild(root)
    if ( root.childNodes.length != 0 ) { 
        console.error("Watch page replace failed: #root is not empty.")
        return
    }
    if ( !localStorage.playersettings ) chrome.storage.local.set({ playersettings: {} })
    createRoot(root).render(watchPage())
    document.dispatchEvent(new CustomEvent("pmw_pageReplaced", { detail: "" }))
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('chrome') == -1 || syncStorage.pmwforcepagehls) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL("js/watch_injector.bundle.js")
        head.appendChild(script)
    }

}

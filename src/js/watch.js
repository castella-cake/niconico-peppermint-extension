import { createRoot } from "react-dom/client";
import { getLocalStorageData, getSyncStorageData } from "./modules/storageControl";
import { watchPage } from "./pages/watch";

const storagePromises = [getSyncStorageData, getLocalStorageData]

Promise.allSettled(storagePromises).then(createCSSRule, onError);
function onError(error) {
    console.log(`Error: ${error}`);
}
function createCSSRule(storages) {
    const syncStorage = storages[0].value
    const localStorage = storages[1].value
    if ( !syncStorage.enablewatchpagereplace ) return
    window.stop()
    if ( !localStorage.playersettings ) chrome.storage.local.set({ playersettings: {} })
    const html = document.querySelector("html")
    html.innerHTML = "<head><meta charset=\"utf-8\"></head><body></body>"
    const body = document.body
    const head = document.head
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', chrome.runtime.getURL("style/watchUI.css"))
    head.appendChild(link)
    const root = document.createElement("div")
    root.id = "root"
    body.appendChild(root)
    if ( root.childNodes.length != 0 ) { 
        console.error("Watch page replace failed: #root is not empty.")
        return
    }
    createRoot(root).render(watchPage())
}

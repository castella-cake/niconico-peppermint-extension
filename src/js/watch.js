import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "./modules/storageControl";
import { watchPage } from "./pages/watch";
getSyncStorageData.then(createCSSRule, onError);
function onError(error) {
    console.log(`Error: ${error}`);
}
function createCSSRule(result) {
    if ( !result.enablewatchpagereplace ) return
    window.stop()
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

import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "./modules/storageControl";
import { watchPage } from "./pages/watch";
getSyncStorageData.then(createCSSRule, onError);
function onError(error) {
    console.log(`Error: ${error}`);
}
function createCSSRule(result) {
    if ( !result.enablewatchpagereplace ) return
    const html = document.querySelector("html")
    html.innerHTML = "<head><body></body>"
    const body = document.body
    const root = document.createElement("div")
    root.id = "root"
    body.appendChild(root)
    createRoot(root).render(watchPage())
}

import {
    getLocalStorageData,
    getSyncStorageData,
} from "../utils/storageControl";
import { createRoot } from "react-dom/client";
import { watchPage } from "../components/PMWatch/watch";
import "@/components/PMWatch/index.styl"

// Old Twitter Layoutの実装を大いに参考にさせていただきました
// https://github.com/dimdenGD/OldTwitter/blob/master/scripts/blockBeforeInject.js
function blockScriptElement(element: Element) {
    const href: string = element.getAttribute("href") ?? ""
    if ( element.tagName.toLowerCase() === "script" && element.getAttribute("pmw-isplugin") !== "true" ) {
        console.log("blocked:",element);
        element.setAttribute("type", 'javascript/blocked')
        function onBeforeScriptExecute(e: Event) {
            if ( element.getAttribute("type") === "javascript/blocked") {
                e.preventDefault();
            }
            element.removeEventListener('beforescriptexecute', onBeforeScriptExecute);
        }
        element.addEventListener('beforescriptexecute', onBeforeScriptExecute);
        element.remove();
    } else if ( element.tagName.toLowerCase() === "link" && ( typeof element.getAttribute("href") === "string" && href.includes("resource.video.nimg.jp") ) ) {
        console.log("blocked:",element);
        element.setAttribute("href", "");
    } else {
        console.log("not blocked:",element);
    }
}

export default defineContentScript({
    matches: ["*://www.nicovideo.jp/watch/*"],
    runAt: "document_start",
    main() {
        const storagePromises = [getSyncStorageData, getLocalStorageData];

        Promise.allSettled(storagePromises).then(createCSSRule, onError);
        function onError(error: Error) {
            console.log(`Error: ${error}`);
        }
        function createCSSRule(
            storages: any,
        ) {
            const syncStorage: { [key: string]: any } = storages[0].value;
            const localStorage: { [key: string]: any } = storages[1].value;
            if (!syncStorage.enablewatchpagereplace) return;

            const queryString = location.search;
            const searchParams = new URLSearchParams(queryString);
            if (searchParams.get("nopmw") == "true") return;

            document.documentElement.classList.add(`PMW-Enabled`);

            if ( import.meta.env.FIREFOX ) window.stop() // これでなぜかFirefoxで虚無になる問題が治る。逆にChromeのコードに入れると問題が起こる。
            if (!document.documentElement) return;

            // わたってくるdocumentには既に動画情報のレスポンスが入っている。使えるならこっちを使って高速化してしまったほうが良いので、innerHTMLが書き換わる前に取得しておく
            const initialResponse = document.getElementsByName('server-response')[0].getAttribute("content") ?? "" 

            document.documentElement.innerHTML = `
                <head>
                    <meta charset="utf-8">
                    <link rel="shortcut icon" href="https://resource.video.nimg.jp/web/images/favicon/favicon.ico">
                    <meta name="initial-response" content="{}">
                </head>
                <body>
                    <div id="ads-130"></div>
                </body>
            `;
            const head = document.head;
            const observer = new MutationObserver((records) => {
                records.forEach((record) => {
                    const addedNodes = record.addedNodes;
                    for (const node of addedNodes) {
                        console.log("node: ", node)
                        const elem = node as Element;
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            blockScriptElement(elem);
                            elem.querySelectorAll('script').forEach(blockScriptElement);
                        }
                    }
                });
            });
            observer.observe(head, { childList: true, subtree: true });
            
            if (import.meta.env.FIREFOX || syncStorage.pmwforcepagehls) {
                const script = document.createElement("script");
                script.src = browser.runtime.getURL("/watch_injector.js");
                script.setAttribute("pmw-isplugin", "true");
                head.appendChild(script);
            }

            
            //console.log("initialResponse", JSON.parse(initialResponse))
            // さっき書き換える前に取得した値を書き戻す。innerHTMLに直接埋め込むのは信用できない。
            document.getElementsByName('initial-response')[0].setAttribute("content", initialResponse);

            if (
                syncStorage.darkmode === "custom" &&
                syncStorage.customcolorpalette !== undefined
            ) {
                const varArray = Object.keys(syncStorage.customcolorpalette).map(item => {
                    return `--${item}: ${syncStorage.customcolorpalette[item]};`
                })
                document.documentElement.setAttribute(
                    "style",
                    `${document.body.style}
                    ${varArray.join("")}`
                );
            } else if ( syncStorage.darkmode !== "" ) {
                document.documentElement.classList.add(`PMDMP-${syncStorage.darkmode}`);
            } else {
                document.documentElement.classList.add(`PMDMP-light`);
            }

            const body = document.body;
            const root = document.createElement("div");
            root.id = "root";
            body.appendChild(root);
            if (root.childNodes.length != 0) {
                console.error("Watch page replace failed: #root is not empty.");
                return;
            }

            if (!localStorage.playersettings)
                chrome.storage.local.set({ playersettings: {} });

            createRoot(root).render(watchPage());
            document.dispatchEvent(new CustomEvent("pmw_pageReplaced", { detail: "" }));
        }
    }
})
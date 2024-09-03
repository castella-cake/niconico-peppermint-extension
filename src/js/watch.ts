import {
    getLocalStorageData,
    getSyncStorageData,
} from "./modules/storageControl";
//import "react-devtools"
import { createRoot } from "react-dom/client";
import { watchPage } from "./pages/watch";

const storagePromises = [getSyncStorageData, getLocalStorageData];

Promise.allSettled(storagePromises).then(createCSSRule, onError);
function onError(error: Error) {
    console.log(`Error: ${error}`);
}
function createCSSRule(
    storages: PromiseFulfilledResult<{ [key: string]: string[] }>[],
) {
    const syncStorage: { [key: string]: any } = storages[0].value;
    const localStorage = storages[1].value;
    if (!syncStorage.enablewatchpagereplace) return;

    const queryString = location.search;
    const searchParams = new URLSearchParams(queryString);
    if (searchParams.get("nopmw") == "true") return;
    window.stop();

    if (!document.documentElement) return;
    document.documentElement.innerHTML = `
        <head>
            <meta charset="utf-8">
            <link rel="shortcut icon" href="https://resource.video.nimg.jp/web/images/favicon/favicon.ico">
        </head>
        <body>
            <div id="ads-130"></div>
        </body>
    `;
    const head = document.head;
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", chrome.runtime.getURL("style/watchUI.css"));
    head.appendChild(link);

    if (
        syncStorage.darkmode === "custom" &&
        syncStorage.customcolorpalette !== undefined
    ) {
        document.documentElement.setAttribute(
            "style",
            `${document.body.style}
            --bgcolor1:${syncStorage.customcolorpalette.bgcolor1};
            --bgcolor2:${syncStorage.customcolorpalette.bgcolor2};
            --bgcolor3:${syncStorage.customcolorpalette.bgcolor3};
            --bgcolor4:${syncStorage.customcolorpalette.bgcolor4};
            --textcolor1:${syncStorage.customcolorpalette.textcolor1};
            --textcolor2:${syncStorage.customcolorpalette.textcolor2};
            --textcolor3:${syncStorage.customcolorpalette.textcolor3};
            --textcolornew:${syncStorage.customcolorpalette.textcolornew};
            --accent1:${syncStorage.customcolorpalette.accent1};
            --accent2:${syncStorage.customcolorpalette.accent2};
            --hover1:${syncStorage.customcolorpalette.hover1};
            --hover2:${syncStorage.customcolorpalette.hover2};
            --linktext1:${syncStorage.customcolorpalette.linktext1};
            --linktext2:${syncStorage.customcolorpalette.linktext2};
            --linktext3:${syncStorage.customcolorpalette.linktext3};
            --nicoru1:${syncStorage.customcolorpalette.nicoru1};
            --nicoru2:${syncStorage.customcolorpalette.nicoru2};
            --nicoru3:${syncStorage.customcolorpalette.nicoru3};
            --nicoru4:${syncStorage.customcolorpalette.nicoru4};
            --dangerous1:${syncStorage.customcolorpalette.dangerous1 ? syncStorage.customcolorpalette.dangerous1 : "#fff"};`,
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

    const observehead = document.head;
    const observer = new MutationObserver((records) => {
        records.forEach(function (record) {
            const addedNodes = record.addedNodes;
            for (const node of addedNodes) {
                const elem = node as Element;
                console.log(elem);
                // scriptが増えたならこのレンダーはもう維持するべきではないのでリロード
                if (
                    elem.tagName === "link" &&
                    elem.getAttribute("rel") === "modulepreload" &&
                    elem
                        .getAttribute("href")
                        ?.startsWith(
                            "https://resource.video.nimg.jp/web/scripts/nvpc_next/assets/manifest-",
                        )
                ) {
                    location.reload();
                }
            }
        });
    });
    observer.observe(observehead, {
        childList: true,
    });

    if (!localStorage.playersettings)
        chrome.storage.local.set({ playersettings: {} });

    createRoot(root).render(watchPage());
    document.dispatchEvent(new CustomEvent("pmw_pageReplaced", { detail: "" }));

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("chrome") == -1 || syncStorage.pmwforcepagehls) {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("js/watch_injector.bundle.js");
        script.setAttribute("pmw-isplugin", "true");
        head.appendChild(script);
    }
}

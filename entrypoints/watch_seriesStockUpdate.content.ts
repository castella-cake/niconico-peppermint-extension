import { getSyncStorageData } from "../utils/storageControl";

const watchPattern = new MatchPattern('*://www.nicovideo.jp/watch/*');
const seriesAnchorSelector = 'a[data-anchor-page="watch"][data-anchor-area="series"]';
const seriesAnchorTimeoutMs = 5000;

function waitForSeriesAnchor(timeoutMs: number) {
    let cleanup: () => void = () => { };
    const promise = new Promise<boolean>(resolve => {
        if (document.querySelector(seriesAnchorSelector)) {
            resolve(true);
            return;
        }
        const observer = new MutationObserver(() => {
            if (document.querySelector(seriesAnchorSelector)) {
                cleanup();
                resolve(true);
            }
        });
        const timer = setTimeout(() => {
            cleanup();
            resolve(false);
        }, timeoutMs);
        cleanup = () => {
            observer.disconnect();
            clearTimeout(timer);
        };
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    return { promise, cancel: cleanup };
}

export default defineContentScript({
    matches: ["*://www.nicovideo.jp/*"],
    runAt: "document_idle",
    async main(ctx) {
        const result = await getSyncStorageData
        let activeAnchorWait: { cancel: () => void } | null = null;
        async function requestSeriesStockUpdate() {
            if (!watchPattern.includes(location.toString())) return
            // 次のリクエストの前にまだ動いてたら止める
            activeAnchorWait?.cancel();
            activeAnchorWait = null;

            const smId = location.pathname.replace("/watch/", "")
            
            // アンカーの出現を待つ。もうある時はあっちですぐresolveする
            const anchorWait = waitForSeriesAnchor(seriesAnchorTimeoutMs);
            activeAnchorWait = anchorWait;
            const anchorFound = await anchorWait.promise;
            if (anchorWait === activeAnchorWait) activeAnchorWait = null;
            if (!anchorFound) return
            
            browser.runtime.sendMessage({ "type": "updateSeriesStockState", "smId": smId }).then(res => {
                if (res.status != true) console.error(res)
            })
        }
        ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
            if (watchPattern.includes(newUrl) && result.enableseriesstock) {
                requestSeriesStockUpdate()
            }
        });
        requestSeriesStockUpdate()
        return
    },
});


import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "../utils/storageControl";
import WatchActionButtons from "@/components/WatchActionButtons";

const watchPattern = new MatchPattern('*://www.nicovideo.jp/watch/*');
// pmbutton-container は index_end.content.ts が document_end で作成するが、
// 何らかの理由で存在しない場合はこのスクリプト側で用意する。
function ensurePmbuttonContainer(): HTMLElement {
    let container = document.querySelector('.pmbutton-container') as HTMLElement | null;
    if (!container) {
        container = document.createElement('div');
        container.classList.add('pmbutton-container');
        document.body.appendChild(container);
    }
    return container;
}

const seriesAnchorSelector = 'a[data-anchor-page="watch"][data-anchor-area="series"], a[data-pmw-type=\"series-title\"]';
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
    runAt: "document_end",
    async main(ctx) {
        const result = await getSyncStorageData;

        // 既存のシリーズストック更新ロジック (元 watch_seriesStockUpdate.content.ts)
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

        const ui = createIntegratedUi(ctx, {
            position: "inline",
            anchor: ".pmbutton-container",
            onMount: (wrapper) => {
                const root = createRoot(wrapper);
                root.render(<WatchActionButtons />);
                return root;
            },
            onRemove: (root) => {
                root?.unmount();
            },
        });

        // /watch/配下かどうかで表示状態を切り替える。
        // ui.mount() を二重に呼ぶと onMount が再実行されて React root がリークするため、
        // ローカルフラグで多重マウントを防ぐ。
        let isUiMounted = false;

        function refreshWatchUI() {
            const onWatchPage = location.pathname.startsWith('/watch/');
            if (onWatchPage) {
                if (!isUiMounted) {
                    ensurePmbuttonContainer();
                    ui.mount();
                    isUiMounted = true;
                }
            } else {
                if (isUiMounted) {
                    ui.remove();
                    isUiMounted = false;
                }
            }
        }

        ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
            if (watchPattern.includes(newUrl) && result.enableseriesstock) {
                requestSeriesStockUpdate();
            }
            refreshWatchUI();
        });

        requestSeriesStockUpdate();
        refreshWatchUI();
    },
});
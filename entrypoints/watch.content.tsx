import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "../utils/storageControl";
import WatchActionButtons from "@/components/WatchActionButtons";
import SeriesStockButton from "@/components/SeriesStockButton";
import "@/components/MWSeriesStockButton.styl";

const watchPattern = new MatchPattern('*://www.nicovideo.jp/watch/*');

function isMintWatch(): boolean {
    return document.documentElement.classList.contains("MW-Enabled");
}

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

const seriesAnchorSelector = 'a[data-anchor-page="watch"][data-anchor-area="series"], a[data-pmw-type="series-title"]';
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
                root.render(<WatchActionButtons enablePastLogLoader={result.enablePastLogLoader === true} />);
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
            // シリーズストックも過去ログローダーも無効なら、左下UIを使う機能が無いので表示しない
            const hasEnabledFeature = result.enableseriesstock === true || result.enablePastLogLoader === true;
            // MintWatch環境もしくは設定で無効化された場合にも左下UIを使わない
            if (onWatchPage && hasEnabledFeature && !isMintWatch() && !result.disableWatchActionButton) {
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

        let mintWatchStockUi: ReturnType<typeof createIntegratedUi> | null = null;

        function refreshMintWatchUI() {
            const onWatchPage = location.pathname.startsWith('/watch/');
            if (onWatchPage && result.enableseriesstock === true && isMintWatch()) {
                if (!mintWatchStockUi) {
                    mintWatchStockUi = createIntegratedUi(ctx, {
                        position: "inline",
                        anchor: "#pmw-seriesinfo .seriesinfo-content",
                        onMount: (wrapper) => {
                            wrapper.classList.add("pm-series-stock-mount");
                            const root = createRoot(wrapper);
                            root.render(<SeriesStockButton />);
                            return root;
                        },
                        onRemove: (root) => {
                            root?.unmount();
                        },
                    });
                    mintWatchStockUi.autoMount();
                }
            } else {
                if (mintWatchStockUi) {
                    mintWatchStockUi.remove();
                    mintWatchStockUi = null;
                }
            }
        }

        // fetchラッパー (past-log-loader) の注入。
        // 過去ログローダー設定が有効かつ MintWatch 環境でないときに一度だけ注入する
        let pastLogInjected = false;
        function refreshPastLogInjection() {
            if (pastLogInjected) return;
            if (result.enablePastLogLoader !== true) return;
            if (isMintWatch()) return;
            pastLogInjected = true;
            injectScript("/past-log-loader.js").catch((err) => {
                pastLogInjected = false;
                console.error(err);
            });
        }

        function refreshEnvironments() {
            refreshWatchUI();
            refreshMintWatchUI();
            refreshPastLogInjection();
        }

        ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
            // WXTの locationchange はイベント名が名前空間化されるため、
            // React コンポーネント側からは購読できない。ブリッジ用の素のイベントを発行する。
            window.dispatchEvent(new CustomEvent("pmwatch:locationchange"));
            if (watchPattern.includes(newUrl) && result.enableseriesstock && !isMintWatch()) {
                requestSeriesStockUpdate();
            }
            refreshEnvironments();
        });

        document.addEventListener("pmw_playerReady", (e) => {
            if (!document.getElementById("pmwp-pm-peppermintintegration")) {
                console.log("PMW Plugin: PepperMint Integration")
                const pluginList = document.getElementById("pmw-plugin-list")

                const mediaInjectorContainer = document.createElement("div")
                mediaInjectorContainer.id = "pmwp-pm-peppermintintegration"
                mediaInjectorContainer.className = "plugin-list-item"
                mediaInjectorContainer.innerHTML = `
                    <div class="plugin-list-item-title">
                        PepperMint Integration
                    </div>
                    <div class="plugin-list-item-desc">
                        シリーズストックとの統合を行います。
                    </div>
                `
                if (pluginList) pluginList.appendChild(mediaInjectorContainer)
            }
            requestSeriesStockUpdate();
        })

        // MintWatch は別拡張機能のため、MW-Enabled クラスが後から付く/外れる可能性がある
        const mwObserver = new MutationObserver(() => {
            refreshEnvironments();
        });
        mwObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        ctx.onInvalidated(() => mwObserver.disconnect());

        if (!isMintWatch()) {
            requestSeriesStockUpdate();
        }
        refreshEnvironments();
    },
});

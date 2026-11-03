import { useEffect, useState } from "react";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { browser } from "wxt/browser";
import type { SeriesStock } from "@/types/seriesStock";

type SeriesInfo = {
    seriesId: string;
    seriesName: string;
} | null;

function detectSeriesInfo(): SeriesInfo {
    const mintWatchSeriesAnchorElem = document.querySelector('a[data-pmw-type="series-title"]');
    if (mintWatchSeriesAnchorElem && mintWatchSeriesAnchorElem.getAttribute("data-pmw-value")) {
        return {
            seriesId: String(mintWatchSeriesAnchorElem.getAttribute("data-pmw-value")),
            seriesName: mintWatchSeriesAnchorElem.textContent || "",
        };
    }

    const seriesAnchorElem = document.querySelector<HTMLAnchorElement>(
        'a[data-anchor-page="watch"][data-anchor-area="series"]'
    );
    if (!seriesAnchorElem || !seriesAnchorElem.href || !seriesAnchorElem.pathname) return null;

    const splittedPathname = seriesAnchorElem.pathname.split("/");
    if (splittedPathname.length < 3) return null;

    return {
        seriesId: splittedPathname[2],
        seriesName: seriesAnchorElem.textContent || "",
    };
}

export default function SeriesStockButton() {
    const [seriesInfo, setSeriesInfo] = useState<SeriesInfo>(null);
    const [stockedseries, setStockedseries] = useState<SeriesStock[] | undefined>(undefined);
    const [isEnabled, setIsEnabled] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        async function init() {
            const result: { [key: string]: any } = await browser.storage.sync.get(["enableseriesstock", "stockedseries"]);
            setIsEnabled(result.enableseriesstock === true);
            setStockedseries(result.stockedseries || []);
        }
        init();

        function handleStorageChange(changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) {
            if (changes.enableseriesstock) {
                setIsEnabled(changes.enableseriesstock.newValue === true);
            }
            if (changes.stockedseries) {
                setStockedseries((changes.stockedseries.newValue as SeriesStock[]) || []);
            }
        }

        browser.storage.onChanged.addListener(handleStorageChange);
        return () => {
            browser.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    useEffect(() => {
        let observer: MutationObserver | null = null;

        // 値が変わったときだけ setState する (同一内容なら同じ参照を返して bailout させる)。
        // detectSeriesInfo() は毎回新しいオブジェクトを返すため、そのまま setSeriesInfo すると
        // 参照比較で常に更新扱いになり再レンダ → effect 再実行… の無限ループになる。
        function applySeriesInfo(info: SeriesInfo) {
            setSeriesInfo(prev => {
                const unchanged = (!prev && !info)
                    || (prev !== null && info !== null
                        && prev.seriesId === info.seriesId
                        && prev.seriesName === info.seriesName);
                return unchanged ? prev : info;
            });
        }

        function startObserver() {
            if (observer) return;
            observer = new MutationObserver(() => {
                const info = detectSeriesInfo();
                if (info) {
                    applySeriesInfo(info);
                    stopObserver();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        function stopObserver() {
            observer?.disconnect();
            observer = null;
        }

        // 初回検出。アンカーが未出現なら MutationObserver で出現を待つ
        const initial = detectSeriesInfo();
        applySeriesInfo(initial);
        if (!initial) startObserver();

        function handleLocationChange() {
            const info = detectSeriesInfo();
            applySeriesInfo(info);
            if (info) {
                stopObserver();
            } else {
                startObserver();
            }
        }
        // watch.content.tsx が wxt:locationchange を受け、素のイベント名で再発行しているブリッジを購読する
        // (WXT の locationchange はイベント名が名前空間化されるため直接購読できない)
        window.addEventListener("pmwatch:locationchange", handleLocationChange);

        return () => {
            stopObserver();
            window.removeEventListener("pmwatch:locationchange", handleLocationChange);
        };
    }, []);

    const isStocked =
        seriesInfo && stockedseries
            ? stockedseries.some((item) => String(item.seriesID) === String(seriesInfo.seriesId))
            : false;

    async function handleToggle() {
        if (!seriesInfo) return;

        const result: { [key: string]: any } = await browser.storage.sync.get("stockedseries");
        const currentStock: SeriesStock[] = result.stockedseries || [];
        const isCurrentlyStocked = currentStock.some(
            (item) => String(item.seriesID) === String(seriesInfo.seriesId)
        );

        let nextStock: SeriesStock[];
        if (isCurrentlyStocked) {
            nextStock = currentStock.filter(
                (item) => String(item.seriesID) !== String(seriesInfo.seriesId)
            );
        } else {
            nextStock = [
                ...currentStock,
                { seriesID: seriesInfo.seriesId, seriesName: seriesInfo.seriesName } as unknown as SeriesStock,
            ];
        }

        await browser.storage.sync.set({ stockedseries: nextStock });
        setStockedseries(nextStock);
    }

    if (isEnabled === false) return null;

    // シリーズが見つからない・ストック情報読込中は非表示ではなく無効化して表示する
    const isDisabled = !seriesInfo || stockedseries === undefined;

    return (
        <button
            type="button"
            className="watch-action-button"
            data-stocked={isStocked}
            disabled={isDisabled}
            title={!seriesInfo ? "シリーズが見つかりません" : (isStocked ? "シリーズをストックから削除" : "シリーズをストックに追加")}
            onClick={handleToggle}
        >
            {isStocked ? <IconMinus /> : <IconPlus />}
            <span>{isStocked ? "ストックから削除" : "シリーズを追加"}</span>
        </button>
    );
}

import { getSyncStorageData } from "../utils/storageControl";

const watchPattern = new MatchPattern('*://www.nicovideo.jp/watch/*');

export default defineContentScript({
    matches: ["*://www.nicovideo.jp/*"],
    runAt: "document_idle",
    async main(ctx) {
        const result = await getSyncStorageData
        function requestSeriesStockUpdate() {
            if (!watchPattern.includes(location.toString())) return
            const smId = location.pathname.replace("/watch/", "")
            browser.runtime.sendMessage({ "type": "updateSeriesStockState", "smId": smId }).then(res => {
                if (res.status != true) console.error(res)
            })
        }
        ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
            if (watchPattern.includes(newUrl) && result.enableseriesstock) {
                requestSeriesStockUpdate()
            }
        });
        return
    },
});


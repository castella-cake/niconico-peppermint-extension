import { getSyncStorageData } from "../utils/storageControl";

export default defineContentScript({
    matches: ["*://www.nicovideo.jp/watch/*"],
    runAt: "document_idle",
    async main() {
        const result = await getSyncStorageData
        function requestSeriesStockUpdate() {
            const smId = location.pathname.slice(7).replace(/\?.*/, '')
            browser.runtime.sendMessage({ "type": "updateSeriesStockState", "smId": smId }).then(res => {
                if (res.status != true) console.error(res)
            })
        }
        if (result.enableseriesstock) {
            requestSeriesStockUpdate()
            let previousPathname = location.pathname
            // TODO: 今はobserverで随時pathnameを確認しているけど、navigationのイベントが一般化されたら置き換える。
            const body = document.body
            const bodyObserver = new MutationObserver(records => {
                if ( previousPathname != location.pathname ) {
                    requestSeriesStockUpdate()
                    previousPathname = location.pathname
                    //console.log("updated")
                }
            })
            bodyObserver.observe(body, {
                childList: true
            })
        }
        return
    },
});


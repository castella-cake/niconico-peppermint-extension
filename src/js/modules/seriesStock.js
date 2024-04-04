function manageSeriesStock(seriesid, seriesname = '名称未設定') {
    return new Promise((resolve, reject) => {
        try {
            // シリーズストックの管理を行う非同期Function。存在しない場合はストックに追加し、すでに存在する場合はストックから削除します。
            // 追加した場合はtrueを、削除した場合はfalseをresolveします。
            // このため、.thenを使って追加された後に行う処理/削除された後に行う処理をIsSeriesStockedを使用せず簡潔に書くことができます。
            chrome.storage.sync.get(["stockedseries"]).then((stockdata) => {
                if (stockdata.stockedseries != undefined && stockdata.stockedseries.findIndex(series => series.seriesID === seriesid) != -1) {
                    let currentstock = stockdata.stockedseries
                    let newstock = currentstock.filter(obj => obj.seriesID !== seriesid);
                    chrome.storage.sync.set({
                        "stockedseries": newstock
                    }).then(() => {
                        //console.log(`Removed series from stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(false)
                    })
                } else {
                    let currentstock = stockdata.stockedseries || []
                    currentstock.push({ seriesID: seriesid, seriesName: seriesname });
                    chrome.storage.sync.set({
                        "stockedseries": currentstock
                    }).then(() => {
                        //console.log(`Added series to stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(true)
                    })
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

function seriesIsStocked(seriesid) {
    // 渡されたシリーズIDがシリーズストック内にストックされているかどうかを返します。
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(["stockedseries"], function (stockdata) {
                //console.log(seriesid)
                let currentstock = stockdata.stockedseries || [];
                //console.log(stockdata)
                //console.log(currentstock.findIndex(series => series.seriesID === seriesid) != -1)
                resolve(currentstock.findIndex(series => series.seriesID === seriesid) != -1);
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { manageSeriesStock, seriesIsStocked }
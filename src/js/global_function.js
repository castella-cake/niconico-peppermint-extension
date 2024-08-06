// www.nicovideo.jpの全てで実行。publicのfunction置き場です。
// TODO: すべてのモジュール化が完了次第、これは削除する
function onError(error) {
    console.log(`Error: ${error}`);
}
function addCSS(cssfile, safeAppend = true, var2 = 'head', var3 = 'root') {
    // headの後にstylesheetとしてlinkをくっつけるやつ
    // 書き方: cssfile(必須), 二重書き防止(任意), after/before/appendに使う要素(任意), モード(after,before,append 任意)
    // 二重書き防止と要素は反転して使うことができる(a.css,body,falseのように)
    if (safeAppend == true || safeAppend == false) {
        var isSafeAppend = safeAppend;
        var elementvar = var2;
        var mode = var3;
    } else {
        var elementvar = safeAppend;
        if (var2 == true || var2 == false) {
            var isSafeAppend = var2;
        } else {
            var isSafeAppend = true;
        }
        var mode = var3;
    }
    if (mode == 'root') {
        let targetelem = document.querySelector('head')
        let link = document.createElement('link')
        if ((document.querySelector(`link[href="${cssfile}"]`) == null || isSafeAppend == false) && targetelem != null) {
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('href', cssfile)
            const headlinkarray = document.querySelectorAll('head link[rel="stylesheet"]')
            if (headlinkarray.length == 0 || headlinkarray == null) {
                targetelem.after(link)
                //console.log('ALT MODE')
            } else {
                targetelem.appendChild(link)
                //console.log('NORMAL MODE')
            }
        } else {
            if (!(document.querySelector(`link[href="${cssfile}"]`) == null || isSafeAppend == false)) {
                //console.log(`addCSS() skipped because safeappend is enabled but already added`)
            } else {
                //console.log(`addCSS() skipped because targetelem is null`)
            }

        }
    } else {
        let targetelem = document.querySelector(elementvar)
        let link = document.createElement('link')
        if ((document.querySelector(`link[href="${cssfile}"]`) == null || isSafeAppend == false) && targetelem != null) {
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('href', cssfile)
            if (mode == 'after') {
                targetelem.after(link)
            } else if (mode == 'before') {
                targetelem.before(link)
            } else if (mode == 'append') {
                targetelem.appendChild(link)
            } else {
                mode = 'after(fallback)'
                targetelem.after(link)
            }
            //console.log(`CSS added( ${mode}: ${elementvar}, safeappend = ${safeappend} ): ${cssfile}`);
        } else {
            if (!(document.querySelector(`link[href="${cssfile}"]`) == null || isSafeAppend == false)) {
                //console.log(`addCSS() skipped because safeappend is enabled but already added`)
            } else {
                //console.log(`addCSS() skipped because targetelem is null`)
            }

        }
    }
}
function removeCSS(cssfile) {
    // 同じlinkを2回書かないように対策されてるやつ
    if (document.querySelector(`link[href="${cssfile}"]`) != null) {
        $(`link[href="${cssfile}"]`).remove();
        //console.log(`CSS removed: ${cssfile}`);
    } else {
        onError(`link element ${cssfile} is not found!`)
    }
}

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
function isDarkmode() {
    chrome.storage.sync.get(["darkmode", "darkmodedynamic"]).then((result) => {
        if (result.darkmode == "" || result.darkmode == undefined || result.darkmode == null) {
            return (false)
        } else if (result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return (false)
        } else if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            return (true)
        }
    })
}

async function seriesIsStocked(seriesid) {
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
function pushCSSRule(string) {
    if (document.getElementById('peppermint-css') == null || document.getElementById('peppermint-css') == undefined) {
        let html = document.documentElement;
        let peppermintStyle = document.createElement('style')
        peppermintStyle.id = "peppermint-css"
        html.appendChild(peppermintStyle)
    }
    document.getElementById('peppermint-css').textContent = document.getElementById('peppermint-css').textContent + string
}


var getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
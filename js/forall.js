// www.nicovideo.jpの全てで実行
function onError(error) {
    console.log(`Error: ${error}`);
}
function addCSS(cssfile, var1 = true, var2 = 'head', var3 = 'after') {
    // headの後にstylesheetとしてlinkをくっつけるやつ
    // 書き方: cssfile(必須), 二重書き防止(任意), after/before/appendに使う要素(任意), モード(after,before,append 任意)
    // 二重書き防止と要素は反転して使うことができる(a.css,body,falseのように)
    if (var1 == true || var1 == false) {
        var safeappend = var1;
        var elementvar = var2;
        var mode = var3;
    } else {
        var elementvar = var1;
        if (var2 == true || var2 == false) {
            var safeappend = var2;
        } else {
            var safeappend = true;
        }
        var mode = var3;
    }
    if (document.querySelector(`link[href="${cssfile}"]`) == null || safeappend == false) {
        if (mode == 'after') {
            $(elementvar).after($('<link>').attr({ 'rel': 'stylesheet', 'href': cssfile }));
        } else if (mode == 'before') {
            $(elementvar).before($('<link>').attr({ 'rel': 'stylesheet', 'href': cssfile }));
        } else if (mode == 'append') {
            $(elementvar).append($('<link>').attr({ 'rel': 'stylesheet', 'href': cssfile }));
        } else {
            mode = 'after(fallback)'
            $(elementvar).after($('<link>').attr({ 'rel': 'stylesheet', 'href': cssfile }));
        }
        console.log(`CSS added( ${mode}: ${elementvar}, safeappend = ${safeappend} ): ${cssfile}`);
    }
}
function removeCSS(cssfile) {
    // 同じlinkを2回書かないように対策されてるやつ
    if (document.querySelector(`link[href="${cssfile}"]`) != null) {
        $(`link[href="${cssfile}"]`).remove();
        console.log(`CSS removed: ${cssfile}`);
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
                        console.log(`Removed series from stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(false)
                    })
                } else {
                    let currentstock = stockdata.stockedseries || []
                    currentstock.push({ seriesID: seriesid, seriesName: seriesname });
                    chrome.storage.sync.set({
                        "stockedseries": currentstock
                    }).then(() => {
                        console.log(`Added series to stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(true)
                    })
                }
            })
        } catch (error) {
            reject(error);
        }
    });
}

/*
$(document).on('keypress', keypress_event);

function keypress_event(e) {
    if((e.key === 'q' || e.key === 'Q') && !$(e.target).closest("input, textarea").length ){
        $('img,span,a,svg,li,div > div > div').each(function(i, elem) {
            setTimeout( function () {
                console.log('hello!')
                $(elem).css({
                    'transition': 'transform 1s ease-in',
                    'transform': 'translate(0,800px)'
                })
            }, (Math.floor(Math.random() * 80) * i)) //
        })
    }
}*/

async function seriesIsStocked(seriesid) {
    // 渡されたシリーズIDがシリーズストック内にストックされているかどうかを返します。
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(["stockedseries"], function (stockdata) {
                console.log(seriesid)
                let currentstock = stockdata.stockedseries || [];
                console.log(stockdata)
                console.log(currentstock.findIndex(series => series.seriesID === seriesid) != -1)
                resolve(currentstock.findIndex(series => series.seriesID === seriesid) != -1);
            });
        } catch (error) {
            reject(error);
        }
    });
}

var getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
getStorageData.then(createBaseCSSRule, onError);
function createBaseCSSRule(result) {
    if (result.highlightnewnotice == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/other/highlightnewnotice.css"))
    }
    if (result.hidepopup == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/hide/hidepopup.css"))
    }
    if (result.enablevisualpatch == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/visualpatch.css"))
    }
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        /*
        if ( result.darkmode == "pmcolor" ) {
            $('body').css({
                '--bgcolor1': '#252525',
                '--bgcolor2': '#333',
                '--bgcolor3': '#666',
                '--bgcolor4': '#aaa',
                '--textcolor1': '#fff',
                '--textcolor2': '#ddd',
                '--textcolor3': '#aaa',
                '--textcolornew': '#e05050',
                '--accent1': '#444',
                '--accent2': '#888',
                '--hover1': '#666',
                '--hover2': '#aaa',
                '--linktext1': '#8fb9df',
                '--linktext2': '#8ed9ff',
                '--linktext3': '#008acf',
            })
        } else if ( result.darkmode == "spcolor" ) {
            $('body').css({
                '--bgcolor1': '#191919',
                '--bgcolor2': '#252525',
                '--bgcolor3': '#3b3b3b',
                '--bgcolor4': '#aaa',
                '--textcolor1': '#fff',
                '--textcolor2': '#ddd',
                '--textcolor3': '#aaa',
                '--textcolornew': '#e05050',
                '--accent1': '#3b3b3b',
                '--accent2': '#929292',
                '--hover1': '#666',
                '--hover2': '#bebebe',
                '--linktext1': '#8fb9df',
                '--linktext2': '#8ed9ff',
                '--linktext3': '#008acf',
            })
        } else if ( result.darkmode == "nordcolor" ) {
            $('body').css({
                '--bgcolor1': 'var(--nord0)',
                '--bgcolor2': 'var(--nord1)',
                '--bgcolor3': 'var(--nord2)',
                '--bgcolor4': 'var(--nord3)',
                '--textcolor1': 'var(--nord6)',
                '--textcolor2': 'var(--nord5)',
                '--textcolor3': 'var(--nord7)',
                '--textcolornew': 'var(--nord11)',
                '--accent1': 'var(--nord1)',
                '--accent2': 'var(--nord2)',
                '--hover1': 'var(--nord2)',
                '--hover2': 'var(--nord3)',
                '--linktext1': 'var(--nord8)',
                '--linktext2': 'var(--nord8)',
                '--linktext3': 'var(--nord8)',
            })
        } else {
            $('body').css({
                '--bgcolor1': '#000',
                '--bgcolor2': '#1a1a1a',
                '--bgcolor3': '#252525',
                '--bgcolor4': '#3a3a3a',
                '--textcolor1': '#fff',
                '--textcolor2': '#ddd',
                '--textcolor3': '#aaa',
                '--textcolornew': '#e05050',
                '--accent1': '#1e1e1e',
                '--accent2': '#2a2a2a',
                '--hover1': '#404040',
                '--hover2': '#5a5a5a',
                '--linktext1': '#8fb9df',
                '--linktext2': '#8ed9ff',
                '--linktext3': '#008acf',
            })
        }*/
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"), true);
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/all.css"));
        //addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true, `link[href="${chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css")}"]`, 'before')
    } else { addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true) }
    if (result.alignpagewidth == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
    } else {
        console.log(result.alignpagewidth)
    }
}
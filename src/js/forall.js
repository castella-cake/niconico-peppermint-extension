// www.nicovideo.jpの全てで実行
function onError(error) {
    console.log(`Error: ${error}`);
}

if (document.getElementById('peppermint-css') == null || document.getElementById('peppermint-css') == undefined) {
    let html = document.querySelector('html');
    let peppermintStyle = document.createElement('style')
    peppermintStyle.id = "peppermint-css"
    html.appendChild(peppermintStyle)
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
                console.log('ALT MODE')
            } else {
                targetelem.appendChild(link)
                console.log('NORMAL MODE')
            }
        } else {
            if (!(document.querySelector(`link[href="${cssfile}"]`) == null || isSafeAppend == false)) {
                console.log(`addCSS() skipped because safeappend is enabled but already added`)
            } else {
                console.log(`addCSS() skipped because targetelem is null`)
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
                console.log(`addCSS() skipped because safeappend is enabled but already added`)
            } else {
                console.log(`addCSS() skipped because targetelem is null`)
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

/*
$(document).on('keypress', keypress_event);

function keypress_event(e) {
    if((e.key === 'q' || e.key === 'Q') && !$(e.target).closest("input, textarea").length ){
        $('img,span,a,svg,li,div > div > div').each(function(i, elem) {
            setTimeout( function () {
                //console.log('hello!')
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
const observehtml = document.documentElement
const observer = new MutationObserver(records => {
    records.forEach(function (record) {
        var addedNodes = record.addedNodes;
        for (var i = 0; i < addedNodes.length; i++) {
            var node = addedNodes[i];
            if (node.tagName === 'HEAD') {
                getStorageData.then(createBaseCSSRule, onError);
                observer.disconnect();
                break;
            }
        }
    });
})
if (document.head == null) {
    console.log('alternative mode')
    observer.observe(observehtml, {
        childList: true
    })
} else {
    getStorageData.then(createBaseCSSRule, onError);
}
//console.log(document.documentElement.innerHTML)
//console.log(document.querySelectorAll('head link'))
getStorageData.then(createFastCSSRule, onError);

function createFastCSSRule(result) {
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) && location.hostname != "ext.nicovideo.jp") {
        document.documentElement.classList.add('PMDM-Assist')
        if (result.darkmode == 'black') {
            document.documentElement.style = "--pre-bgcolor: #000;"
        } else if (result.darkmode == 'pmcolor') {
            document.documentElement.style = "--pre-bgcolor: #252525;"
        } else if (result.darkmode == 'spcolor') {
            document.documentElement.style = "--pre-bgcolor: #191919;"
        } else if (result.darkmode == 'nordcolor') {
            document.documentElement.style = "--pre-bgcolor: #2e3440;"
        } else if (result.darkmode == 'cybernight') {
            document.documentElement.style = "--pre-bgcolor: #0b1721;"
        } else if (result.darkmode == 'custom' && result.customcolorpalette != undefined && result.customcolorpalette.bgcolor1 != undefined) {
            document.documentElement.style = `--pre-bgcolor: ${result.customcolorpalette.bgcolor1};`
        } else {
            document.documentElement.style = "--pre-bgcolor: #000;"
        }
        //console.log(result.darkmode)
        if (location.hostname == "blog.nicovideo.jp" && location.pathname.startsWith("/niconews")) {
            document.documentElement.classList.add('PMDM-NicoInfo')
        }
        if ( result.highlightnewnotice == true ) {
            document.documentElement.classList.add('PM-HighlightNewNotice')
        }
        if ( result.hidesupporterbutton == "all" || (result.hidesupporterbutton == "watch" && location.pathname.indexOf('/watch') != -1) ) {
            document.documentElement.classList.add('PM-HideSupporter')
        }
        if ( result.alignpagewidth == true ) {
            document.documentElement.classList.add('PM-AlignPageWidth')
        }
    } 
} 

function createBaseCSSRule(result) {
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        if (result.darkmode == 'custom' && result.customcolorpalette != undefined) {
            pushCSSRule(`:root{--bgcolor1:${result.customcolorpalette.bgcolor1};--bgcolor2:${result.customcolorpalette.bgcolor2};--bgcolor3:${result.customcolorpalette.bgcolor3};--bgcolor4:${result.customcolorpalette.bgcolor4};--textcolor1:${result.customcolorpalette.textcolor1};--textcolor2:${result.customcolorpalette.textcolor2};--textcolor3:${result.customcolorpalette.textcolor3};--textcolornew:${result.customcolorpalette.textcolornew};--accent1:${result.customcolorpalette.accent1};--accent2:${result.customcolorpalette.accent2};--hover1:${result.customcolorpalette.hover1};--hover2:${result.customcolorpalette.hover2};--linktext1:${result.customcolorpalette.linktext1};--linktext2:${result.customcolorpalette.linktext2};--linktext3:${result.customcolorpalette.linktext3};--nicoru1:${result.customcolorpalette.nicoru1};--nicoru2:${result.customcolorpalette.nicoru2};--nicoru3:${result.customcolorpalette.nicoru3};--nicoru4:${result.customcolorpalette.nicoru4};}`)
        } else {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
        }

        if (location.hostname != "game.nicovideo.jp" && location.hostname != "qa.nicovideo.jp") {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/all.css"), true);
            if (location.hostname == "www.nicovideo.jp") {
                if (location.pathname.indexOf('/video_top') != -1) {
                    //console.log('vidtop')
                    addCSS(chrome.runtime.getURL("pagemod/css/darkmode/video_top.css"), true);
                    if (result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) {
                        pushCSSRule('.RankingVideosContainer .ColumnTitle-icon,.ViewHistoriesContainer .ColumnTitle-icon,.NicoadVideosContainer .ColumnTitle-icon,.HotTagsContainer .ColumnTitle-icon,.NewArrivalVideosContainer .ColumnTitle-icon,.NewsNotificationContainer-column[data-sub-column="maintenance"] .ColumnTitle-icon {filter: brightness(5.0)}')
                    }
                } else if (location.pathname.indexOf('/ranking') != -1) {
                    addCSS(chrome.runtime.getURL("pagemod/css/darkmode/ranking.css"), true);
                } else if (location.pathname.indexOf('/watch') != -1 && result.usetheaterui != true && result.usenicoboxui != true) {
                    addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"), true);
                }
            }
        }
        //addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true, `link[href="${chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css")}"]`, 'before')
        //document.documentElement.classList.add('PMDM-Assist')
        //document.documentElement.style = "--pre-bgcolor: #000"
    } else { addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true) }
    if (result.highlightnewnotice == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/other/highlightnewnotice.css"))
    }
    if (result.enablevisualpatch == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/visualpatch.css"))
    }
    if (result.alignpagewidth == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
    } else {
        //console.log(result.alignpagewidth)
    }
}
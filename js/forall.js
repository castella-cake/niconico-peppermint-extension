// www.nicovideo.jpの全てで実行
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    function addCSS(cssfile, var1 = false, var2 = 'head', var3 = 'after') {
        // headの後にstylesheetとしてlinkをくっつけるやつ
        // 書き方: cssfile(必須), 二重書き防止(任意), after/before/appendに使う要素(任意), モード(after,before,append 任意)
        // 二重書き防止と要素は反転して使うことができる(a.css,body,falseのように)
        if ( var1 == true || var1 == false ) {
            var safeappend = var1;
            var elementvar = var2;
            var mode = var3;
        } else {
            var elementvar = var1;
            if ( var2 == true || var2 == false ) {
                var safeappend = var2;
            } else {
                var safeappend = false;
            }
            var mode = var3;
        }
        if (document.querySelector(`link[href="${cssfile}"]`) == null || safeappend == false  ) {
            if ( mode == 'after' ) {
                $(elementvar).after( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
            } else if ( mode == 'before' ) {
                $(elementvar).before( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
            } else if ( mode == 'append' ) {
                $(elementvar).append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
            } else {
                mode = 'after(fallback)'
                $(elementvar).after( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
            }
            console.log(`CSS added( ${mode}: ${elementvar}, safeappend = ${safeappend} ): ${cssfile}`);
        }
    }
    function removeCSS(cssfile) {
        // 同じlinkを2回書かないように対策されてるやつ
        if (document.querySelector(`link[href="${cssfile}"]`) != null ) {
            $(`link[href="${cssfile}"]`).remove();
            console.log(`CSS removed: ${cssfile}`);
        } else {
            onError(`link element ${cssfile} is not found!`)
        }
    }

    function manageSeriesStock(seriesid, seriesname = '名称未設定') {
        // シリーズストックの管理を行うFunction。存在しない場合はストックに追加し、すでに存在する場合はストックから削除します。
        chrome.storage.sync.get(["stockedseries"]).then((stockdata) => {
            if ( stockdata.stockedseries.findIndex(series => series.seriesID === seriesid ) != -1 ) {
                var currentstock = stockdata.stockedseries
                var newstock = currentstock.filter(obj => obj.seriesID !== seriesid);
                chrome.storage.sync.set({
                    "stockedseries": newstock
                })
                console.log(`Removed series from stock: id = ${seriesid}, name = ${seriesname}`)
                return 'removed';
            } else {
                var currentstock = stockdata.stockedseries
                currentstock.push( { seriesID : seriesid, seriesName : seriesname } );
                chrome.storage.sync.set({
                    "stockedseries": currentstock
                })
                console.log(`Added series to stock: id = ${seriesid}, name = ${seriesname}`)
                return 'added';
            }
        })
    }
    
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(createBaseCSSRule, onError);
    function createBaseCSSRule(result) {
        if ( result.highlightnewnotice == true ) {
            addCSS(chrome.runtime.getURL("pagemod/css/other/highlightnewnotice.css"))
        }
        if ( result.darkmode != "" ) {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/forall.css"));
        }
        if ( result.alignpagewidth == true ) {
            addCSS(chrome.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
        } else {
            console.log(result.alignpagewidth)
        }
    }
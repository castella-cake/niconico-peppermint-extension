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
        let targetelem = document.querySelector(elementvar)
        let link = document.createElement('link')
        link.setAttribute('rel','stylesheet')
        link.setAttribute('href',cssfile)
        if (mode == 'after') {
            targetelem.after(link)
        } else if (mode == 'before') {
            targetelem.before(link)
        } else if (mode == 'append') {
            targetelem.append(link)
        } else {
            mode = 'after(fallback)'
            targetelem.after(link)
        }
        console.log(`CSS added( ${mode}: ${elementvar}, safeappend = ${safeappend} ): ${cssfile}`);
    }
}
var getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.usenicoboxui != true && result.usetheaterui == true ) {
        // theater UI
        // video関連は早めにスタイルシートで書かないとコメントコンテナーやシンボルが動画サイズの変更を反映してくれない
        addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        addCSS(chrome.runtime.getURL("pagemod/css/header/black.css"))
    }
    if (result.nicoboxuichanged == true) {
        console.log('changed!')
        $('#CommonHeader')
        .css({
            'transform': 'translate(0, -100%)',
        })
        .css({
            'transform': 'translate(0, 0)',
            'transition': 'transform 0.2s ease',
        })
        $('body').append('<div id="fadeouter"></div>')
        setTimeout(function() {
            $('#fadeouter').css({
                'opacity':'0%',
                'transition': 'opacity 0.2s ease',
            })
        },1)
        setTimeout(function() {
            $('#fadeouter').remove()
        },300)
        chrome.storage.sync.set({"nicoboxuichanged": false});
    }
    if (result.usenicoboxui != true && result.usetheaterui != true && result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
        if (result.watchpagetheme != "") {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watchpagetheme/" + result.watchpagetheme + ".css"));
        }
    }
}

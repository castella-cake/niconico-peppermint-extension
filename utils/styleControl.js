export function addCSS(cssfile, safeAppend = true, var2 = 'head', var3 = 'root') {
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
export function removeCSS(cssfile) {
    // 同じlinkを2回書かないように対策されてるやつ
    if (document.querySelector(`link[href="${cssfile}"]`) != null) {
        $(`link[href="${cssfile}"]`).remove();
        //console.log(`CSS removed: ${cssfile}`);
    } else {
        onError(`link element ${cssfile} is not found!`)
    }
}

export function addPMStyleElem() {
    if (document.getElementById('peppermint-css')) {
        return false;
    }
    const html = document.documentElement;
    let peppermintStyle = document.createElement('style');
    peppermintStyle.id = "peppermint-css";
    html.appendChild(peppermintStyle);
    return true;
}

export function pushCSSRule(string) {
    if (!document.getElementById('peppermint-css')) {
        addPMStyleElem()
    }
    document.getElementById('peppermint-css').textContent = document.getElementById('peppermint-css').textContent + string
}

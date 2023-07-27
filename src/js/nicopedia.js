//console.log(`hello nicopedia!`)
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.dicfullwidth == true && result.dicforcewidthmode != "auto" && result.dicforcewidthmode != "100" ) {
        addCSS(chrome.runtime.getURL("pagemod/css/nicopedia/fullwidth.css"))
    } else if ( result.dicfullwidth == true && result.dicforcewidthmode == "auto" ) {
        addCSS(chrome.runtime.getURL("pagemod/css/nicopedia/fullwidth_forceauto.css"))
    } else if ( result.dicfullwidth == true && result.dicforcewidthmode == "100" ) {
        addCSS(chrome.runtime.getURL("pagemod/css/nicopedia/fullwidth_force100.css"))
    }
    if ( result.dicbettereditor ) {
        addCSS(chrome.runtime.getURL("pagemod/css/nicopedia/bettereditor.css"))
    }
}
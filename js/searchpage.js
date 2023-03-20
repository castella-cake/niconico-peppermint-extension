
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/searchpage.css"));
    }
}

getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.darkmode != "" ) {
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/searchpage.css"));
    }
}
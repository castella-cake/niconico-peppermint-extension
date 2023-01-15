
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.darkmode != "" ) {
        appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/searchpage.css"));
    }
}
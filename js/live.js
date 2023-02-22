var getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    console.log(result.darkmode)
    if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
        addCSS(chrome.runtime.getURL("pagemod/css/darkmode/live.css"));
    }
}

    getStorageData.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
            addCSS(chrome.runtime.getURL("style/css/darkmode/ranking.css"));
        }
        if ( result.hiderankpagead == true ) {
            document.documentElement.classList.add('PM-HideRankingPageNiconiAdRow')
        }
    }
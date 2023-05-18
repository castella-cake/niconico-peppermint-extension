
    getStorageData.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/ranking.css"));
        }
        if ( result.hiderankpagead == true ) {
            pushCSSRule('.RankingMatrixNicoadsRow,.NC-NicoadMediaObject,.RankingMainNicoad,.ContinuousPlayButtonTeaching,.NC-Balloon-arrowWrap{display: none};')
        }
    }
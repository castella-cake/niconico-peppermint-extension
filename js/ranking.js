
    getStorageData.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.darkmode != "" ) {
            appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/ranking.css"));
        }
        if ( result.hiderankpagead == true ) {
            $('.RankingMatrixNicoadsRow,.NC-NicoadMediaObject,.RankingMainNicoad').css('display', 'none');
        }
    }
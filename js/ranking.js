
    getStorageData.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/ranking.css"));
        }
        if ( result.hiderankpagead == true ) {
            $('.RankingMatrixNicoadsRow,.NC-NicoadMediaObject,.RankingMainNicoad').css('display', 'none');
            $(function() {
                $('.ContinuousPlayButtonTeaching,.NC-Balloon-arrowWrap').remove()
            })
        }
    }
$(function(){
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    var getting = browser.storage.sync.get(null);
    getting.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.hiderankpagead == true ) {
            $('.RankingMatrixNicoadsRow,.NC-NicoadMediaObject').css('display', 'none');
        }
    }
});
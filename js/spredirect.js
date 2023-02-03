getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.enablespredirect == true ) {
        location.href=location.href.replace("sp.nicovideo.jp","www.nicovideo.jp");
    }
}
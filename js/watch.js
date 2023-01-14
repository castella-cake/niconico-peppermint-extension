function onError(error) {
    console.log(`Error: ${error}`);
}
function appendCSS(cssfile) {
    $('head').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
}
var getting = browser.storage.sync.get(null);
getting.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.playertheme != "") {
        console.log(`CSS Loaded!`);
        if (result.playerstyleoverride == "") {
            appendCSS(browser.runtime.getURL("pagemod/css/playerstyle/" + result.playertheme + ".css"));
        } else if (result.playerstyleoverride != "none") {
            appendCSS(browser.runtime.getURL("pagemod/css/playerstyle/" + result.playerstyleoverride + ".css"));
        }
        appendCSS(browser.runtime.getURL("pagemod/css/playertheme/" + result.playertheme + ".css"));
    }
    if (result.hidepopup == true) {
        console.log(`Hiding popup...`)
        // cssじゃないとロードの都合で反映されなかった
        //$('.FollowAppeal,.SeekBarStoryboardPremiumLink-content,.PreVideoStartPremiumLinkContainer').css('display','none')
        appendCSS(browser.runtime.getURL("pagemod/css/hide/hidepopup.css"));
    }
    if (result.hideeventbanner == true) {
        // 未検証
        $('.WakutkoolNoticeContainer, .WakutkoolFooterContainer, .WakutkoolHeaderContainer-image').css('display','none')
    }
    if (result.replacemarqueetext == true) {
        appendCSS(browser.runtime.getURL("pagemod/css/hide/replacemarqueetext.css"));
    }
    if ( result.darkmode != "" ) {
        appendCSS(browser.runtime.getURL("pagemod/css/darkmode/watch.css"));
        $(function() { appendCSS(browser.runtime.getURL("pagemod/css/darkmode/watch_ichiba.css")) });
    }
}

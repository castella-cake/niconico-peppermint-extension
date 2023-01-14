function onError(error) {
    console.log(`Error: ${error}`);
}
function appendCSS(cssfile) {
    $('head').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
}
var getting = browser.storage.sync.get(null);
getting.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.darkmode != "" ) {
        appendCSS(browser.runtime.getURL("pagemod/css/darkmode/video_top.css"));
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}
function appendCSS(cssfile) {
    $('body').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
}
var getting = browser.storage.sync.get(null);
getting.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.playertheme == "hrzkv1") {
        console.log(`CSS Loaded!`);
        appendCSS(browser.runtime.getURL("pagemod/css/playerstyle/harazyuku.css"));
        appendCSS(browser.runtime.getURL("pagemod/css/playertheme/harazyuku.css"));
        $('.ControllerContainer-inner').css('top', '3px');
    } else {
        console.log(`CSS not Loaded!`)
    }
}

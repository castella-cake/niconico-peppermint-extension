// www.nicovideo.jpの全てで実行

$(function(){
    function onError(error) {
        console.log(`Error: ${error}`);
    }
    function appendCSS(cssfile) {
        $('body').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
    }
    var getting = browser.storage.sync.get(null);
    getting.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.alignpagewidth == true ) {
            /*
            $('.TopPage-section,.common-header-654o26').css({
                'max-width': '1024px',
                'min-width': '1024px',
                'width': '1024px'
            });
            */
            appendCSS(browser.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
        }
    }
});
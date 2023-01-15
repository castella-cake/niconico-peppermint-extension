// www.nicovideo.jpの全てで実行

    function onError(error) {
        console.log(`Error: ${error}`);
    }
    function appendCSS(cssfile) {
        $('head').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
        console.log(`CSS Added: ${cssfile}`);
    }
    var getstoragedata = browser.storage.sync.get(null);
    getstoragedata.then(createCSSRule, onError);
    function createCSSRule(result) {
        if ( result.darkmode != "" ) {
            appendCSS(browser.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
            appendCSS(browser.runtime.getURL("pagemod/css/darkmode/forall.css"));
            $(function() { 
                appendCSS(browser.runtime.getURL("pagemod/css/darkmode/header.css"))
                appendCSS(browser.runtime.getURL("pagemod/css/darkmode/userpage.css"))
            });
        }
        if ( result.alignpagewidth == true ) {
            appendCSS(browser.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
        }
        if (result.headerbg == "gradient") {
            appendCSS(browser.runtime.getURL("pagemod/css/header/gradient.css"));
        } else if (result.headerbg == "custom") {
            $(function() {
            appendCSS(browser.runtime.getURL("pagemod/css/header/custom.css"));
            $('body').css('--headercolor', result.headercolor);
            console.log(`HeaderBG changed to ${result.headercolor}`);
        });
        }
    }
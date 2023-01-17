// www.nicovideo.jpの全てで実行

    function onError(error) {
        console.log(`Error: ${error}`);
    }
    function appendCSS(cssfile) {
        $('head').append( $('<link>').attr( {'rel': 'stylesheet','href': cssfile} ) );
        console.log(`CSS Added: ${cssfile}`);
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));

    getStorageData.then(createBaseCSSRule, onError);
    function createBaseCSSRule(result) {
        if ( result.darkmode != "" ) {
            appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
            appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/forall.css"));
            $(function() {
                // 初めて読み込む時だとロード終わりを待たないとだめっぽい
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/forall.css"));
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/header.css"))
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/userpage.css"))
            });
        }
        if ( result.alignpagewidth == true ) {
            appendCSS(chrome.runtime.getURL("pagemod/css/other/alignpagewidth.css"));
        }
        if ( result.highlightnewnotice == true ) {
            $(function() {appendCSS(chrome.runtime.getURL("pagemod/css/other/highlightnewnotice.css"))});
        }
        if (result.headerbg == "gradient") {
            appendCSS(chrome.runtime.getURL("pagemod/css/header/gradient.css"));
        } else if (result.headerbg == "custom") {
            $(function() {
            appendCSS(chrome.runtime.getURL("pagemod/css/header/custom.css"));
            $('body').css('--headercolor', result.headercolor);
            console.log(`HeaderBG changed to ${result.headercolor}`);
        });
        }
    }
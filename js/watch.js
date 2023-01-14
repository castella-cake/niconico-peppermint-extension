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
    if (result.watchpagetheme != "") {
        console.log(`CSS Loaded!`);
        appendCSS(browser.runtime.getURL("pagemod/css/watchpagetheme/" + result.watchpagetheme + ".css"));
        if (result.darkmode != "" ) {
            appendCSS(browser.runtime.getURL("pagemod/css/darkmode/watchpagetheme/" + result.watchpagetheme + ".css"));
        }
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
        /* 
        $(function() { 
            $('.Marquee-itemArea').css({
                'background-image' : 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNDAuNCA0OC45Ij48cGF0aCBkPSJNMjY1LjcgNmMtMTUuOCAxNS4zLTE0IDMyLjUtOS43IDM5IC45IDEuMSAyIDMgNCAyLjIgMS43LS43IDEuNy0yLjYuNi0zLjktNi02LjgtMy41LTIxLjYgNy0zMy42LjgtLjkgNC4zLTEgMi40LTMuOC0xLTEuNi0zLjQtLjgtNC4zIDBabTYwLjktLjNjLTItMi01LjMtLjktNC44IDEuOC4yIDEgMS44IDEuNSAyLjMgMS4zIDQuNyA4LjIgMS4xIDI3LTkuMyAzMy44LTEuNSAxLTIgMy0xIDMuOS42LjUgMS42IDEuNiA0LjUtLjQgOS41LTYuNyAxNy40LTMxLjQgOC40LTQwLjRabS0xNS43IDMyLjVjLTIuMy0xLjYtOC42LTQuNS0xMy0xMC41IDMuNy0xLjQgOC4yLTMuNyAxMC42LTYuMSA2LTYgMS0xMS43LTQtMTIuNC01LjYtLjctMTEuMiAxLjQtMTIuNCAyLjYtMS40IDEuNS44IDQgMSAzLjQtMS42IDQtNy41IDI1LjItNy45IDI3LS41IDEuNy45IDMgMiAzIDEuNC4yIDIuOS0uMyAzLjMtMmwzLTEzYzUuMiA2LjkgMTIuNyAxMSAxNCAxMiAxLjIgMSAyLjkuNSAzLjctLjMgMS4yLTEuMy41LTMuMi0uMy0zLjdaTTI5NS43IDIzbDMuMi05LjNjMi45LS42IDcuNi4zIDcuMyAyLjQtLjYgMi44LTYuNCA1LjUtMTAuNSA3Wm0tOS40LjZjMC00LjgtNy41LTcuNy0xMy4zLTIuNy05LjMgNy45LTcgMjIuOCAyLjEgMjIuOCA0LjMgMCA3LjktMi4yIDcuOC00LjYgMC0xLjQtMS4zLTIuNy0yLjYtMi4zLTEuNC41LTMuMSAyLjMtNiAxLTItLjgtMi00LjItMS43LTUuMiA1LjggMi45IDEzLjctNC4yIDEzLjctOVptLTEyLjUgNC43YzEtMy42IDUuMy02LjYgNy42LTUuMyAxLjUgMi0zLjUgNy03LjYgNS4zWiIgc3R5bGU9ImZpbGw6IzQ0NCIvPjxwYXRoIGQ9Ik00NSA5LjFIMzAuNmw1LjktNS42Yy44LS43LjktMiAwLTIuOWEyIDIgMCAwIDAtMi44IDBsLTkgOC41LTktOC41YTIgMiAwIDAgMC0zIDAgMiAyIDAgMCAwIC4yIDNMMTguOCA5SDQuNEMyIDkuMSAwIDExLjEgMCAxMy41djI2LjZjMCAyLjQgMiA0LjQgNC40IDQuNEgxMGwzLjMgMy45Yy42LjYgMS41LjYgMiAwbDMuNC00aDEybDMuMyA0Yy42LjYgMS41LjYgMiAwbDMuNC00SDQ1YzIuNCAwIDQuNC0xLjkgNC40LTQuM1YxMy41YzAtMi40LTItNC40LTQuNC00LjRabTU4LjYgMy44YTQgNCAwIDAgMC00LTQuMUg3My40Yy0yLjIgMC00IDEuOC00IDQuMXMxLjggNC4xIDQgNC4xaDI2LjJhNCA0IDAgMCAwIDQtNC4xWm0uNCAyNy44YTQgNCAwIDAgMC00LTRINzNjLTIuMiAwLTQgMS44LTQgNHMxLjggNC4xIDQgNC4xaDI3YTQgNCAwIDAgMCA0LTRabTQzLjgtNS43VjE4YzAtNS40LTQuMy05LjgtOS43LTkuOGgtMjAuOGMtMi4yIDAtNCAxLjgtNCA0LjFzMS44IDQuMSA0IDQuMWgxOC44YzIuMiAwIDMuNiAxLjQgMy42IDMuN1YzM2MwIDIuNC0xLjMgMy43LTMuNiAzLjdoLTE4LjhjLTIuMiAwLTQgMS45LTQgNC4xczEuOCA0LjIgNCA0LjJoMjAuOGM1LjQgMCA5LjctNC41IDkuNy05LjlabTQ0LjgtMjIuMWE0IDQgMCAwIDAtNC00LjFoLTI2LjJjLTIuMyAwLTQgMS44LTQgNHMxLjcgNC4yIDQgNC4yaDI2LjFhNCA0IDAgMCAwIDQtNC4xWm0uNCAyNy44YTQgNCAwIDAgMC00LTRoLTI3Yy0yLjMgMC00IDEuOC00IDRzMS43IDQuMSA0IDQuMWgyN2E0IDQgMCAwIDAgNC00Wm00My44LTUuN1YxOGMwLTUuNC00LjMtOS44LTkuNy05LjhoLTIwLjhjLTIuMiAwLTQgMS44LTQgNC4xczEuOCA0LjEgNCA0LjFoMTguOGMyLjEgMCAzLjYgMS40IDMuNiAzLjdWMzNjMCAyLjQtMS4zIDMuNy0zLjYgMy43aC0xOC44Yy0yLjIgMC00IDEuOS00IDQuMXMxLjggNC4yIDQgNC4yaDIwLjhjNS40IDAgOS43LTQuNSA5LjctOS45WiIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzQ0NCIvPjwvc3ZnPg==")',
                'background-repeat': 'no-repeat',
                'background-position': 'center',
                'background-size': '180px 25px',
                'background-clip': 'content-box'
            })
            $('.DefaultAnimator-text, .DefaultAnimator-category,.DefaultAnimator-excludeButton, .Marquee-buttonArea').css('display','none')
        });*/
    }
    if ( result.darkmode != "" ) {
        appendCSS(browser.runtime.getURL("pagemod/css/darkmode/watch.css"));
        $(function() { appendCSS(browser.runtime.getURL("pagemod/css/darkmode/watch_ichiba.css")) });
    }
    if (result.highlightlockedtag == true) {
        $(function() { $('.TagItem.is-locked').css('border', '1px solid #ffd794') });
    }
}

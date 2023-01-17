getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.enablenicoboxui == true) {
        appendCSS("https://fonts.googleapis.com/icon?family=Material+Icons")
        $('body').append('<button id="togglenicobox" class="material-icons" style="cursor: pointer; position: sticky; left:16px; bottom:16px; width: 52px; height:52px; border:none; background: #d85353; border-radius: 128px; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); padding:0px; color: #fff; font-size: 24px;">music_note</button>');
        $("#togglenicobox").load(chrome.runtime.getURL("pagemod/svg/nicotv-toggle.svg"))
        $('#togglenicobox').on('click', ToggleNicobox);
        function ToggleNicobox() {
            console.log(`Nicobox Toggled!!! ${result.usenicoboxui}`)
            chrome.storage.sync.set({"usenicoboxui": !result.usenicoboxui});
            location.reload();
        }
    }
    if (result.usenicoboxui != true) {
        if (result.playertheme != "") {
            console.log(`CSS Loaded!`);
            if (result.playerstyleoverride == "") {
                appendCSS(chrome.runtime.getURL("pagemod/css/playerstyle/" + result.playertheme + ".css"));
            } else if (result.playerstyleoverride != "none") {
                appendCSS(chrome.runtime.getURL("pagemod/css/playerstyle/" + result.playerstyleoverride + ".css"));
            }
            appendCSS(chrome.runtime.getURL("pagemod/css/playertheme/" + result.playertheme + ".css"));
        }
        if (result.watchpagetheme != "") {
            console.log(`CSS Loaded!`);
            appendCSS(chrome.runtime.getURL("pagemod/css/watchpagetheme/" + result.watchpagetheme + ".css"));
        }
        if (result.hidepopup == true) {
            console.log(`Hiding popup...`)
            // cssじゃないとロードの都合で反映されなかった
            //$('.FollowAppeal,.SeekBarStoryboardPremiumLink-content,.PreVideoStartPremiumLinkContainer').css('display','none')
            appendCSS(chrome.runtime.getURL("pagemod/css/hide/hidepopup.css"));
        }
        if (result.hideeventbanner == true) {
            // 未検証
            $('.WakutkoolNoticeContainer, .WakutkoolFooterContainer, .WakutkoolHeaderContainer-image').css('display','none')
        }
        if (result.replacemarqueetext == true) {
            appendCSS(chrome.runtime.getURL("pagemod/css/hide/replacemarqueetext.css"));
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
            appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
            $(function() { appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch_ichiba.css")) });
            if (result.watchpagetheme != "") {
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/watchpagetheme/" + result.watchpagetheme + ".css"));
            }
        }
        if (result.highlightlockedtag == true) {
            $(function() { $('.TagItem.is-locked').css('border', '1px solid #ffd794') });
        }
    } else {
        $(function() {
            // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
            appendCSS(chrome.runtime.getURL("pagemod/css/nicobox/main.css"));
            $('body').css('background-color','#fefefe')
            // 基本レイアウト変更
            $('.HeaderContainer').before($('.MainContainer'));
            $('.BottomRightNoticeCenter').after($('.MainContainer-playerPanel'));
            $('.MainContainer').css({
                'padding-top': '200px',
                'box-shadow': '0px 0px 0px #000',
                'width': '100%'
            })
            $('.MainContainer-player').css({
                'width': '100%'
            })
            $('.WatchAppContainer-main').css({
                'width':'calc( 100% - 384px )',
                'right':'384px',
                'margin':'0 0 0 auto',
                'padding':'0px 64px'
            })
            $('.MainContainer-playerPanel').css({
                'position':'fixed',
                'top':'36px',
            })
            $('.VideoContainer').css({
                'background':'transparent',
                'margin':'auto',
                'overflow':'visible'
            })
            // かつてヘッダーだったもの(動画情報)
            $('.HeaderContainer-row > .GridCell.col-full').removeClass('col-full')
            $('.VideoTitle').css('color','#d85353')
            $('.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand').css('background','linear-gradient(90deg,hsla(0,0%,96%,0),#fefefe 16%)')
            $('.HeaderContainer-searchBox').css({
                'position':'fixed',
                'top':'36px',
                'left':'0'
            })
            $('.HeaderContainer').css({
                'width': '100%',
                'padding': '16px 8px 0',
                'margin': '0 0 240px'
            })
            $('.HeaderContainer-topArea').css('text-align','center')
            $('.HeaderContainer-row .GridCell:last-child').css({
                'width':'fit-content',
                'display':'flex'
            })
            $('.HeaderContainer-row').css({
                'width':'fit-content',
                'display':'flex',
                'margin':'auto auto 12px'
            })
            $('.VideoOwnerInfo').css({
                'position':'absolute',
                'right':'0'
            })
            // プレイヤー
            $('.PlayerContainer,.ControllerBoxContainer').css('background-color','transparent')
            $('.VideoDescriptionContainer').css({
                'left': '25%'
            })
            $('.ControllerBoxContainer').css({
                'margin-top': '64px',
                'padding': '0 128px'
            })
            $('.ControllerContainer').css({
                'height': '48px'
            })
            $('.PlayerPlayTime').css({
                'text-shadow':'0px 0px 0px #000',
                'position': 'absolute',
                'left': '0',
                'width': '100%',
                'top': '-20px'
            })
            $('.PlayTimeFormatter.PlayerPlayTime-playtime').css({
                'position': 'absolute',
                'left': '20px'
            })
            $('.PlayTimeFormatter.PlayerPlayTime-duration').css({
                'position': 'absolute',
                'right': '20px'
            })
            $('.PlayerSeekBackwardButton, .SeekToHeadButton').css({
                'position':'relative',
                'right':'20px'
            })
            $('.PlayerSeekForwardButton').css({
                'position':'relative',
                'left':'20px'
            })
            $('.VideoPlayer video').css({
                'width':'auto',
                'margin':'auto',
                'box-shadow':'0px 0px 10px rgba(0,0,0,0.8);'
            })
            $('.CommentOnOffButton').css('display','none')
            $('.SeekBarContainer').css('padding','8px 64px 0')
            $('.SeekBar-played').css('background-color','#d85353')
            $('.SeekBar-buffered').css('background-color','#666')
            // 不要な要素の削除
            $('.MainContainer-marquee, .ControllerBoxCommentAreaContainer, .CommentRenderer, .PlayerPlayTime-separator,.BottomContainer').remove();
            window.scroll({top: 0, behavior: 'smooth'});
            if ( result.darkmode != "" ) {
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
                appendCSS(chrome.runtime.getURL("pagemod/css/darkmode/nicobox.css"));
                $('.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand').css('background','linear-gradient(90deg,hsla(0,0%,96%,0),var(--bgcolor1) 16%)')
            } else {
                $('.HeaderContainer').css({
                    'background':'#fefefe'
                })
                $('.PlayerPlayTime').css({
                    'color': '#1d2128',
                })
            }
        });
    }
    console.log(`createCSSRule Finished!`)
}
/*
$('#togglenicobox').on('click', function() {
    console.log(`Nicobox Toggled!!!`)
    alert("Nicobox万歳！！！！");
    getstoragedata.then(function(result) {
        cchrome.storage.sync.set("usenicoboxui", !result.usenicoboxui);
    }, onError);
});*/

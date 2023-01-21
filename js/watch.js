getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    console.log(result)
    if ( result.enableseriesstock == true ) {
        $('.pmbutton-container').append('<div class="addtostock-container" style="padding-left: 10px; margin-bottom: 8px"><a id="addtostock" class="material-icons-outlined subaction-button">add</a></div>')
        
        if ( document.querySelector('.SeriesBreadcrumbs-title') != null ) {
            console.log(result.stockedseries)
            let stockedseries = result.stockedseries || [];
            function updateSeriesNextVid() {
                let stockedseriesarray = result.stockedseries
                $.each(stockedseriesarray, function(i,object) {
                    if ( object.seriesID == $('.SeriesBreadcrumbs-title').prop('href').slice(32) ) {
                        console.log(`current series! ${location.pathname.slice(7)}`)
                        object.lastVidID = location.pathname.slice(7)
                        object.lastVidName = $('.VideoTitle').text()
                        if ( document.querySelector('.VideoDescriptionExpander-switchExpand') != null ) {
                            // 概要欄から読み取るので、概要欄が開かれてないときは一瞬開いて読み取る
                            $('.VideoDescriptionExpander-switch').trigger('click');
                            if ( document.querySelector('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle') != null ) {
                                object.nextVidID = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').prop('href').slice(31).replace(/\?.*/, '')
                                object.nextVidName = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').text()
                            }
                            $('.VideoDescriptionExpander-switch').trigger('click');
                        } else {
                            if ( document.querySelector('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle') != null ) {
                                object.nextVidID = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').prop('href').slice(31).replace(/\?.*/, '')
                                object.nextVidName = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').text()
                            }
                        }
                        console.log(object)
                    }
                })
                chrome.storage.sync.set({
                    "stockedseries": stockedseriesarray
                })
            }
            updateSeriesNextVid()
            // ニコニコは動画リンクを踏んだ時実際にはページを移動していないので、視聴回数の変更で動画の変更を検知する
            $('.VideoMetaContainer .VideoViewCountMeta').on('DOMSubtreeModified propertychange', function() {
                console.log(`Video changed!!`)
                updateSeriesNextVid()
            });

            $('#addtostock').on('mouseenter', function() {
                $('.addtostock-container').append('<span id="addtostock-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">シリーズをストックに追加</span>')
                if ( seriesIsStocked($('.SeriesBreadcrumbs-title').prop('href').slice(32)) == false ) {
                    $('#addtostock-text').text("シリーズをストックから削除")
                }
            })
            $('#addtostock').on('mouseleave', function() {
                $('#addtostock-text').remove()
            })
            if ( seriesIsStocked($('.SeriesBreadcrumbs-title').prop('href').slice(32)) == true ) {
                $('#addtostock').text("remove")
            }
            $('#addtostock').on('click', function() {
                manageSeriesStock($('.SeriesBreadcrumbs-title').prop('href').slice(32), $('.SeriesBreadcrumbs-title').text())
                if ( seriesIsStocked($('.SeriesBreadcrumbs-title').prop('href').slice(32)) == true ) {
                    $('#addtostock').text("remove")
                    $("#addtostock-text").text("シリーズをストックから削除")
                } else {
                    $('#addtostock').text("add")
                    $("#addtostock-text").text("シリーズをストックに追加")
                }
            })
        } else {
            $('#addtostock').addClass('disabled')
            $('#addtostock').on('mouseenter', function() {
                $('.addtostock-container').append('<span id="addtostock-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">この動画にはシリーズがありません</span>')
            })
            $('#addtostock').on('mouseleave', function() {
                $('#addtostock-text').remove()
            })
        }
    }

    if ( result.enabledlbutton == true ) {
        $('.pmbutton-container').append('<div class="downloadvideo-container" style="padding-left: 10px; margin-bottom: 8px"><a id="downloadvideo" class="material-icons subaction-button" target="_blank" rel="noopener noreferrer">download</a></div>')
        if (location.pathname.slice(7,9) != "so") {
            $('#downloadvideo').on('mouseenter', function() {
                    $('.downloadvideo-container').append('<span id="downloadvideo-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">動画をダウンロード</span>')
            })
            $('#downloadvideo').on('mouseleave', function() {
                    $('#downloadvideo-text').remove()
            })
            $('#downloadvideo').on('click', setDownloadButton);
            function setDownloadButton(e) {
                // 誤爆防止のために、一回目は行われたクリック操作をなかったことにする
                if ( $(e.target).attr('href') == undefined ) {
                    e.preventDefault();
                }
                // videoのsrcを取得する
                let videourl = $('.MainVideoPlayer video').attr('src');
                // ロード前にクリックされるかもしれないので、undefinedだったら蹴る
                if ( videourl == undefined || videourl == "" || videourl == null ) {
                    $('#downloadvideo-text').text('ダウンロードリンクの設定に失敗しました')
                } else {
                    $('#downloadvideo-text').text('もう一度クリックしてダウンロード')
                    $('#downloadvideo').css({
                        'background':'#4caf50',
                        'color':'#fff',
                        'transition':'all .1s'
                    })
                    // hrefを設定
                    // Downloadは書いてるけどクロスオリジン関係で動かないっぽい
                    $(e.target).attr({
                        download: location.pathname.slice(7) + ".mp4",
                        href: videourl
                    })
                }
            }
        } else {
            $('#downloadvideo').addClass('disabled')
            $('#downloadvideo').text('file_download_off')
            $('#downloadvideo').on('mouseenter', function() {
                $('.downloadvideo-container').append('<span id="downloadvideo-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">この動画はダウンロードできません</span>')
            })
            $('#downloadvideo').on('mouseleave', function() {
                $('#downloadvideo-text').remove()
            })
        }
    }
    if ( result.usetheaterui == true ) {
        let fullsize = false
        $('.pmbutton-container').append('<div class="togglefullsize-container" style="padding-left: 10px; margin-bottom: 8px"><a id="togglefullsize" class="material-icons-outlined subaction-button">width_full</a></div>')
        $('#togglefullsize').on('mouseenter', function() {
            $('.togglefullsize-container').append('<span id="togglefullsize-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">21:9で拡大</span>')
        })
        $('#togglefullsize').on('mouseleave', function() {
            $('#togglefullsize-text').remove()
        })
            $('#togglefullsize').on('click', setFullsize);
        function setFullsize(e) {
            fullsize = !fullsize
            if ( fullsize == true ) {
                addCSS(chrome.runtime.getURL("pagemod/css/theater_21_9_full.css"), `link[href="${chrome.runtime.getURL("pagemod/css/theater_video.css")}"]`)
                $('#togglefullsize').css({
                    'background':'#0288d1',
                    'color':'#fff',
                    'transition':'all .1s'
                })
            } else {
                removeCSS(chrome.runtime.getURL("pagemod/css/theater_21_9_full.css"))
                $('#togglefullsize').css({
                    'background':'#ccc',
                    'color':'#222',
                    'transition':'all .1s'
                })
            }
        }
    }
    if (result.enablenicoboxui == true) {
        $('.pmbutton-container').append('<div class="togglenicobox-container"><button id="togglenicobox" class="material-icons mainaction-button">headphones</button></div>')
        if (result.usenicoboxui != true) {
            $('#togglenicobox').css({
                'background': '#d85353'
            })
        } else {
            $('#togglenicobox').css({
                'background': '#555'
            })
            $('#togglenicobox').text('video_library')
        }
        $('#togglenicobox').on('mouseenter', function() {
                $('.togglenicobox-container').append('<span id="togglenicobox-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%);">Nicoboxへ切り替え</span>')
                if (result.usenicoboxui == true) {
                    $('#togglenicobox-text').text('通常プレイヤーへ戻る')
                }
        })
        $('#togglenicobox').on('mouseleave', function() {
                $('#togglenicobox-text').remove()
        })
        $('#togglenicobox').on('click', ToggleNicobox);
        function ToggleNicobox() {
            console.log(`Nicobox Toggled!!! ${result.usenicoboxui}`)
            chrome.storage.sync.set({"usenicoboxui": !result.usenicoboxui});
            location.reload();
        }
    }
    if (result.usenicoboxui != true && result.usetheaterui != true ) {
        if (result.playertheme != "") {
            console.log(`CSS Loaded!`);
            if (result.playerstyleoverride == "") {
                addCSS(chrome.runtime.getURL("pagemod/css/playerstyle/" + result.playertheme + ".css"));
            } else if (result.playerstyleoverride != "none") {
                addCSS(chrome.runtime.getURL("pagemod/css/playerstyle/" + result.playerstyleoverride + ".css"));
            }
            addCSS(chrome.runtime.getURL("pagemod/css/playertheme/" + result.playertheme + ".css"));
        }
        if (result.watchpagetheme != "") {
            console.log(`CSS Loaded!`);
            addCSS(chrome.runtime.getURL("pagemod/css/watchpagetheme/" + result.watchpagetheme + ".css"));
        }
        if (result.hidepopup == true) {
            console.log(`Hiding popup...`)
            // cssじゃないとロードの都合で反映されなかった
            //$('.FollowAppeal,.SeekBarStoryboardPremiumLink-content,.PreVideoStartPremiumLinkContainer').css('display','none')
            addCSS(chrome.runtime.getURL("pagemod/css/hide/hidepopup.css"));
        }
        if (result.hideeventbanner == true) {
            // 未検証
            $('.WakutkoolNoticeContainer, .WakutkoolFooterContainer, .WakutkoolHeaderContainer-image').css('display','none')
        }
        if (result.replacemarqueetext == true) {
            addCSS(chrome.runtime.getURL("pagemod/css/hide/replacemarqueetext.css"));
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
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
            $(function() { addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch_ichiba.css")) });
            if (result.watchpagetheme != "") {
                addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watchpagetheme/" + result.watchpagetheme + ".css"));
            }
        }
        if (result.highlightlockedtag == true) {
            $(function() { $('.TagItem.is-locked').css('border', '1px solid #ffd794') });
        }
    } else if ( result.usenicoboxui == true ) {
        // Nicobox UI
        $(function() {
            // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
            addCSS(chrome.runtime.getURL("pagemod/css/nicobox.css"));
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
                'height': 'calc( 100% - 72px )',
                'background':'transparent',
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
                'bottom':'0',
                'right':'0'
            })
            $('.SearchBox-input').css('width','335px')
            $('.SearchBox').css('width','382px')
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
                'right':'30px'
            })
            $('.PlayerSeekForwardButton').css({
                'position':'relative',
                'left':'8px'
            })
            $('.MainVideoPlayer video').css({
                'width':'auto',
                'margin':'auto',
                'box-shadow':'0px 0px 10px rgba(0,0,0,0.8)'
            })
            $('.CommentOnOffButton').css('display','none')
            $('.SeekBarContainer').css('padding','8px 64px 0')
            $('.SeekBar-played').css('background-color','#d85353')
            $('.SeekBar-buffered').css('background-color','#666')
            // 不要な要素の削除
            $('.MainContainer-marquee, .ControllerBoxCommentAreaContainer, .CommentRenderer, .PlayerPlayTime-separator,.BottomContainer,.EasyCommentContainer-buttonBox').remove();
            window.scroll({top: 0, behavior: 'smooth'});
            if ( result.darkmode != "" ) {
                addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
                addCSS(chrome.runtime.getURL("pagemod/css/darkmode/nicobox.css"));
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
    } else {
        // theater UI
        $('body').removeClass('is-large')
        $('body').removeClass('is-medium')
        $('body').addClass('is-autoResize')
        $('body').css('background-color','#fefefe')
        // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
        // video関連は早めにスタイルシートで書かないとコメントコンテナーやシンボルが動画サイズの変更を反映してくれない
        //addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        // 基本レイアウト変更
        $('.HeaderContainer').before($('.MainContainer'));
        $('.BottomRightNoticeCenter').after($('.MainContainer-playerPanel'));
        $('.MainContainer').css({
            'padding-top': '16px',
            'box-shadow': '0px 0px 0px #000',
            'width': '100%',
            'background':'#000',
            'margin-bottom':'0px'
        })
        $('.MainContainer-player').css({
            'width': '100%'
        })
        $('.WatchAppContainer-main').css({
            'width':'calc( 100% - 384px )',
            'right':'384px',
            'margin':'0 0 0 auto',
            'padding':'0px 0px'
        })
        $('.MainContainer-playerPanel').css({
            'position':'fixed',
            'top':'36px',
            'height': 'calc( 100% - 72px )',
            'background':'transparent',
        })
        $('.VideoContainer').css({
            'background':'transparent',
            'margin':'auto',
            'overflow':'visible'
        })
        $(function() {
            addCSS(chrome.runtime.getURL("pagemod/css/theater.css"));
            $('.VideoTitle').after($('.SeriesBreadcrumbs'));
            $('.PlayerPanelContainer').css('border-top-left-radius','16px')
            // かつてヘッダーだったもの(動画情報)
            $('.HeaderContainer-row > .GridCell.col-full').removeClass('col-full')
            $('.VideoTitle').css({'color':'#fff','padding-top':'6px'})
            $('.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand').css('background','linear-gradient(90deg,hsla(0,0%,96%,0),#fefefe 16%)')
            $('.HeaderContainer-searchBox').css({
                'position':'fixed',
                'bottom':'0',
                'right':'0'
            })
            $('.SearchBox-input').css('width','335px')
            $('.SearchBox').css('width','382px')
            $('.HeaderContainer').css({
                'width': '100%',
                'padding': '0px 8px 0',
                'margin': '0 0 0'
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
            $('.VideoDescriptionContainer').css({
                'margin':'0 auto'
            })
            $('.ControllerBoxContainer').css({
                'margin-top': '8px',
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
                'right':'30px'
            })
            $('.PlayerSeekForwardButton').css({
                'position':'relative',
                'left':'8px'
            })
            $('.EasyCommentContainer').css(
                'height','auto'
            )
            $('.SeekBarContainer').css('padding','8px 64px 0')
            $('.SeekBar-buffered').css('background-color','#666')
            $('.ControllerBoxCommentAreaContainer, .EasyCommentContainer').css('background','transparent')
            // 不要な要素の削除
            $('.MainContainer-marquee, .PlayerPlayTime-separator, .EasyCommentContainer-buttonBox').remove();
            window.scroll({top: 0, behavior: 'smooth'});
            if ( result.darkmode != "" ) {
                addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch.css"));
                addCSS(chrome.runtime.getURL("pagemod/css/darkmode/watch_ichiba.css"));
            }
            $('.PlayerPlayTime').css({
                'color': '#fff',
            })
            // ダークモードオーバーライド
            $('.BaseLayout-main, .BaseLayout').css('background-color','#000')
            $('.BottomContainer').css('background-color','transparent')
            // 下側
            $('.HeaderContainer').css({
                'background':'#000'
            })
            $('.VideoDescriptionContainer').css({
                'padding':'16px',
                'background':'rgba(255,255,255,0.3);',
                'box-shadow':'0px 0px 5px rgba(255,255,255,0.3)',
                'border-radius':'8px',
                'color':'#fff'
            })
            $('.VideoDescriptionExpander .VideoDescriptionExpander-switch').css({
                'bottom':'8px',
                'text-align':'center',
                'width':'100%',
                'background': 'linear-gradient(180deg,hsla(0,0%,96%,0),#000 25%)'
            })
            $('.TagItem-name').css('color','#fff')
            $('.VideoLiveTimeshiftContainer').css('text-align','center')
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

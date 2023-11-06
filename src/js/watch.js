getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    //console.log(result)
    if ( document.querySelector('.pmbutton-container') == undefined || document.querySelector('.pmbutton-container') == null ) {
        let pmbuttoncontainer = document.createElement('div')
        pmbuttoncontainer.classList.add('pmbutton-container')
        document.body.appendChild(pmbuttoncontainer)
    }

    if (result.enablemisskeyshare == true) {
        // make container
        let sharebtncontainer = document.createElement('div')
        sharebtncontainer.classList.add('misskeyshare-container')
        sharebtncontainer.classList.add('subaction-container')
        // make button elem
        let sharebtnelem = document.createElement('button')
        sharebtnelem.classList.add('subaction-button')
        sharebtnelem.classList.add('material-icons')
        sharebtnelem.classList.add('misskeyshare')
        sharebtnelem.id = "misskeyshare"
        sharebtnelem.textContent = "share"
        sharebtncontainer.appendChild(sharebtnelem)
        // make hint elem
        let sharebtnhint = document.createElement('span')
        sharebtnhint.classList.add('pmui-hinttext')
        sharebtnhint.classList.add('pmui-hinttext-modern')
        if (result.shareinstancelist == undefined || result.shareinstancelist.length < 1) {
            sharebtnhint.textContent = "設定からインスタンスを設定してください"
            sharebtnelem.classList.add('disabled')
        } else {
            sharebtnhint.textContent = "Misskeyで共有"
        }

        sharebtncontainer.appendChild(sharebtnhint)

        sharebtnelem.addEventListener('click', function () {
            if (document.getElementById('misskeysharecontainer') == undefined) {
                let misskeysharecontainer = document.createElement('div')
                misskeysharecontainer.id = "misskeysharecontainer"

                let misskeysharetitle = document.createElement('div')
                misskeysharetitle.classList.add('misskeyshare-title')
                misskeysharetitle.textContent = "Misskeyで共有"
                misskeysharecontainer.appendChild(misskeysharetitle)

                let misskeysharepreviewtitle = document.createElement('div')
                misskeysharepreviewtitle.classList.add('misskeyshare-preview')
                misskeysharepreviewtitle.style = "margin-top: 8px;padding-top: 8px;"
                misskeysharepreviewtitle.textContent = document.querySelector('.VideoTitle').textContent
                misskeysharecontainer.appendChild(misskeysharepreviewtitle)

                let misskeysharepreviewdesc = document.createElement('div')
                misskeysharepreviewdesc.classList.add('misskeyshare-preview')
                misskeysharepreviewdesc.textContent = "#" + location.pathname.slice(7) + " #ニコニコ動画 #PepperMintShare"
                misskeysharecontainer.appendChild(misskeysharepreviewdesc)

                let misskeysharepreviewlink = document.createElement('div')
                misskeysharepreviewlink.classList.add('misskeyshare-preview')
                misskeysharepreviewlink.style = "padding-bottom: 8px;"
                misskeysharepreviewlink.textContent = "https://www.nicovideo.jp/watch/" + location.pathname.slice(7)
                misskeysharecontainer.appendChild(misskeysharepreviewlink)

                let misskeyshareselectcontainer = document.createElement('div')
                misskeyshareselectcontainer.classList.add('misskeyshare-selectinstancecontainer')
                misskeyshareselectcontainer.textContent = "共有先を選択: "
                misskeysharecontainer.appendChild(misskeyshareselectcontainer)

                let misskeyshareselect = document.createElement('select')
                misskeyshareselect.classList.add('misskeyshare-selectinstance')
                misskeyshareselectcontainer.appendChild(misskeyshareselect)
                result.shareinstancelist.forEach((element,i) => {
                    let option = document.createElement('option')
                    option.textContent = element.domain
                    option.value = i
                    misskeyshareselect.appendChild(option)
                });

                let misskeysharebtn = document.createElement('button')
                misskeysharebtn.id = "misskeysharebutton"
                misskeysharebtn.textContent = "投稿画面に移動"
                misskeysharecontainer.appendChild(misskeysharebtn)
                misskeysharebtn.addEventListener('click', function() {
                    let videotitle = document.querySelector('.VideoTitle').textContent
                    let misskeysharelink = "https://" + result.shareinstancelist[misskeyshareselect.value].domain + "/share?title=" + encodeURIComponent(videotitle) + "&text=" + encodeURIComponent("#") + location.pathname.slice(7) + encodeURIComponent(" #ニコニコ動画 #PepperMintShare") + "&url=https://www.nicovideo.jp/watch/" + location.pathname.slice(7)
                    console.log(misskeysharelink)
                    chrome.runtime.sendMessage({"type":"openThisLinkNewTab", "href": misskeysharelink})
                    document.getElementById('misskeysharecontainer').remove()
                })

                let misskeyshareclosebtn = document.createElement('button')
                misskeyshareclosebtn.classList.add('windowclosebutton')
                misskeyshareclosebtn.id = "misskeyshareclosebutton"
                misskeyshareclosebtn.textContent = "キャンセル"
                misskeysharecontainer.appendChild(misskeyshareclosebtn)
                misskeyshareclosebtn.addEventListener('click', function() {
                    document.getElementById('misskeysharecontainer').remove()
                })

                document.querySelector('.pmbutton-container').prepend(misskeysharecontainer)
            } else {
                document.getElementById('misskeysharecontainer').remove()
            }

        })
        // push to dom
        document.querySelector('.pmbutton-container').appendChild(sharebtncontainer)
    }
    // TODO: 将来的にbuttonに置き換える
    if (result.quickvidarticle == true) {
        $('.pmbutton-container').append('<div class="vidarticle-container subaction-container"><a id="openvidarticle" class="subaction-button">百</a></div>')
        $('#openvidarticle').on('mouseenter', function () {
            $('.vidarticle-container').append('<span id="vidarticle-text" class="pmui-hinttext">この動画の大百科記事を開く</span>')
        })
        $('#openvidarticle').on('mouseleave', function () {
            $('#vidarticle-text').remove()
        })
        $('#openvidarticle').on('click', function (e) {
            $(e.target).attr({
                href: "https://dic.nicovideo.jp/v/" + location.pathname.slice(7)
            })
        });

    }
    /*
    if (result.enabledlbutton == true) {
        $('.pmbutton-container').append('<div class="downloadvideo-container subaction-container"><a id="downloadvideo" class="material-icons subaction-button" target="_blank" rel="noopener noreferrer">download</a></div>')
        if (location.pathname.slice(7, 9) != "so") {
            $('#downloadvideo').on('mouseenter', function () {
                $('.downloadvideo-container').append('<span id="downloadvideo-text" class="pmui-hinttext">動画をダウンロード</span>')
            })
            $('#downloadvideo').on('mouseleave', function () {
                $('#downloadvideo-text').remove()
            })
            $('#downloadvideo').on('click', setDownloadButton);
            function setDownloadButton(e) {
                // 誤爆防止のために、一回目は行われたクリック操作をなかったことにする
                if ($(e.target).attr('href') == undefined) {
                    e.preventDefault();
                }
                // videoのsrcを取得する
                let videourl = $('.MainVideoPlayer video').attr('src');
                // ロード前にクリックされるかもしれないので、undefinedだったら蹴る
                if (videourl == undefined || videourl == "" || videourl == null) {
                    $('#downloadvideo-text').text('ダウンロードリンクの設定に失敗しました')
                } else if (videourl.startsWith('blob:')) {
                    $('#downloadvideo-text').text('視聴方式をHTTPに変更してください')
                } else {
                    $('#downloadvideo-text').text('もう一度クリックしてダウンロード')
                    $('#downloadvideo').css({
                        'background': '#4caf50',
                        'color': '#fff',
                        'transition': 'all .1s'
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
            $('#downloadvideo').on('mouseenter', function () {
                $('.downloadvideo-container').append('<span id="downloadvideo-text" class="pmui-hinttext">この動画はダウンロードできません</span>')
            })
            $('#downloadvideo').on('mouseleave', function () {
                $('#downloadvideo-text').remove()
            })
        }
    }*/
    if (result.usetheaterui == true && result.usenicoboxui != true) {
        $('.pmbutton-container').append('<div class="togglefullsize-container subaction-container"><a id="togglefullsize" class="material-icons-outlined subaction-button">width_full</a></div>')
        let togglefullsizeelem = document.getElementById("togglefullsize")
        $('#togglefullsize').on('mouseenter', function () {
            if (togglefullsizeelem.classList.contains("disabled")) {
                $('.togglefullsize-container').append('<span id="togglefullsize-text" class="pmui-hinttext">投稿者によって21:9が強制されています</span>')
            } else {
                $('.togglefullsize-container').append('<span id="togglefullsize-text" class="pmui-hinttext">21:9で拡大</span>')
            }
        })
        $('#togglefullsize').on('mouseleave', function () {
            $('#togglefullsize-text').remove()
        })
        $('#togglefullsize').on('click', setFullsize);
        function setFullsize(e) {
            if (togglefullsizeelem.classList.contains("disabled") != true) {
                if (!document.body.classList.contains("is-PMcinemaratio")) {
                    //addCSS(chrome.runtime.getURL("style/css/theater_21_9_full.css"), `link[href="${chrome.runtime.getURL("style/css/theater_video.css")}"]`)
                    document.body.classList.add('is-PMcinemaratio')
                    $('#togglefullsize').css({
                        'background': '#0288d1',
                        'color': '#fff',
                        'transition': 'all .1s'
                    })
                } else {
                    document.body.classList.remove('is-PMcinemaratio')
                    $('#togglefullsize').css({
                        'background': '#ccc',
                        'color': '#222',
                        'transition': 'all .1s'
                    })
                }
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
        $('#togglenicobox').on('mouseenter', function () {
            $('.togglenicobox-container').append('<span id="togglenicobox-text" class="pmui-hinttext">boxUIへ切り替え</span>')
            if (result.usenicoboxui == true) {
                $('#togglenicobox-text').text('通常プレイヤーへ戻る')
            }
        })
        $('#togglenicobox').on('mouseleave', function () {
            $('#togglenicobox-text').remove()
        })
        $('#togglenicobox').on('click', ToggleNicobox);
        function ToggleNicobox() {
            //console.log(`Nicobox Toggled!!! ${result.usenicoboxui}`)
            chrome.storage.sync.set({ "usenicoboxui": !result.usenicoboxui, "nicoboxuichanged": true });
            $('.togglenicobox-container').css('height', '52px')
            $('#togglenicobox').css({
                'width': '250vw',
                'height': '250vh',
                'transition': 'width 0.25s ease, height 0.25s ease, background-color 0.25s ease',
                'position': 'fixed',
                'left': '-12px',
                'bottom': '36px',
                'transform': 'translate(-50%, 50%)',
                'z-index': '10000000',
                'border-radius': '250vw',
                'background-color': 'var(--bgcolor1)'
            })
            $('#CommonHeader').css({
                'transform': 'translate(0, -100%)',
                'transition': 'transform 0.1s ease',
            })
            setTimeout(function () {
                location.reload()
            }, 250)
        }
    }

    if (result.highlightlockedtag == true) {
        if (result.watchpagetheme == "harazyuku" && result.usenicoboxui != true && result.usetheaterui != true) {
            pushCSSRule('.TagItem.is-locked{border-bottom: 2px solid #ffd794;}')
        } else {
            pushCSSRule('.TagItem.is-locked{border: 1px solid #ffd794;}')
        }

    }
    if (result.hideeventbanner == true) {
        //$('.WakutkoolNoticeContainer, .WakutkoolFooterContainer, .WakutkoolHeaderContainer-image').remove()
        document.documentElement.classList.add('PM-HideEventBanner')
    }
    if (result.commentrow != 1) {
        $('.CommentPostContainer').css('height', `${32 * result.commentrow}px`)
        $('.CommentPostContainer-commandInput .CommentCommandInput, .CommentPostContainer-commentInput .CommentInput, .CommentPostButton.ActionButton').css('height', `${28 * result.commentrow}px`)
    }

    if (result.cleanvidowner) {
        $('.VideoOwnerInfo .FollowButton,.VideoOwnerInfo-linkButtons').remove()
        $('.VideoOwnerInfo-links').css({
            'position': 'relative',
            'top': '6px',
        })
        pushCSSRule('.VideoOwnerInfo-links {position:relative;top:6px;} .VideoOwnerInfo .FollowButton,.VideoOwnerInfo-linkButtons {display:none;}')
    }
    if (result.hidemetadata == "watch" || result.hidemetadata == "all") {
        document.documentElement.classList.add('PM-HideMetaData')
    }

    if (result.shortcutassist) {
        async function cmdACT(cmdstr) {
            // return -1 = ERROR | 0 = SUCCESS | 1 = SUCCESS with external flag | 2 = SUCCESS with external output
            const commandstr = cmdstr
            let runresult = 0
            let runresultstr = ``
            if (commandstr.startsWith('fw/')) {
                location.href = "https://www.nicovideo.jp/search/" + commandstr.slice(2)
            } else if (commandstr.startsWith('ft/')) {
                location.href = "https://www.nicovideo.jp/tag/" + commandstr.slice(3)
            } else if (commandstr.startsWith('w/')) {
                location.href = "https://www.nicovideo.jp/watch/" + commandstr.slice(2)
            } else if (commandstr.startsWith('skt/')) {
                let cmdsec = commandstr.slice(4)
                let videodurationarray = document.querySelector('.PlayerPlayTime-duration').textContent.split(":")
                let videoduration = ( parseInt(videodurationarray[0]) * 60 ) + parseInt(videodurationarray[1])
                // クリックイベントを発火する関数
                function simulateClickAtPosition(element, percentage) {
                    const rect = element.getBoundingClientRect();
                    const clickX = rect.left + (rect.width * percentage);
                    const clickY = rect.top
                    //console.log(`${clickX} ${clickY}`)
                    const mousedownEvent = new MouseEvent("mousedown", {
                        cancelable: true,
                        clientX: clickX,
                        clientY: clickY
                    });
                    const mouseupEvent = new MouseEvent("mouseup", {
                        bubbles: true,
                        cancelable: true,
                        clientX: clickX,
                        clientY: clickY
                    });
                    
                    element.dispatchEvent(mousedownEvent);
                    element.dispatchEvent(mouseupEvent);
                }
                // 発火
                if (cmdsec >= videoduration) {
                    let xSliderElement = document.querySelector(".XSlider");
                    if (xSliderElement) {
                        simulateClickAtPosition(xSliderElement, 1.0);
                    }
                } else {
                    let xSliderElement = document.querySelector(".XSlider");
                    if (xSliderElement) {
                        simulateClickAtPosition(xSliderElement, (cmdsec / videoduration));
                    }
                }
            } else if (commandstr == ":p") {
                document.querySelector('.PlayerPauseButton, .PlayerPlayButton').click();
                document.querySelector(':focus-visible').blur();
            } else if (commandstr == ":>") {
                document.querySelector('.PlayerSkipNextButton').click();
                document.querySelector(':focus-visible').blur();
            } else if (commandstr == ":<") {
                document.querySelector('.SeekToHeadButton').click();
                document.querySelector(':focus-visible').blur();
            } else if (commandstr == ":l") {
                document.querySelector('.LikeActionButton').click();
            } else if (commandstr == ":r") {
                document.querySelector('.PlayerRepeatOnButton, .PlayerRepeatOffButton').click();
                document.querySelector(':focus-visible').blur();
            } else if (commandstr == ":oc") {
                document.querySelectorAll('.PlayerPanelContainer-tabItem')[0].click();
                //document.querySelector(':focus-visible').blur();
            } else if (commandstr == ":op") {
                document.querySelectorAll('.PlayerPanelContainer-tabItem')[1].click();
                document.querySelector('.PlayerPanelContainer-content').focus()
            } else if (commandstr == ":top") {
                location.href = "https://www.nicovideo.jp/video_top"
            } else if (commandstr == "-nbu") {
                chrome.storage.sync.set({ "usenicoboxui": !result.usenicoboxui, "nicoboxuichanged": true });
                location.reload()
            } else if (commandstr == "-tar") {
                chrome.storage.sync.set({ "usetheaterui": !result.usetheaterui });
                location.reload()
            } else if (commandstr == "-cts") {
                runresult = -1
                if (result.enableseriesstock == true && document.querySelector('.SeriesBreadcrumbs-title') != null) {
                    if (await manageSeriesStock(document.querySelector('.SeriesBreadcrumbs-title').href.slice(32), document.querySelector('.SeriesBreadcrumbs-title').textContent)) {
                        runresult = 2
                        runresultstr = `SUCCESS(ADDED)`
                    } else {
                        runresult = 2
                        runresultstr = `SUCCESS(REMOVED)`
                    }
                }
            } else if (commandstr == "help" || commandstr == "HELP" || commandstr == "Help") {
                runresult = 2
                runresultstr = `PEPPERMINT EXCOMMANDER<br>
                PepperMint ExShortcut Commanderは、マウス無しで視聴ページの操作を行うコマンダーです。BackSpaceキーを押して開きます。<br>
                fw/<検索ワード> = キーワード検索を行います。<br>
                ft/<検索ワード> = タグ検索を行います。<br>
                w/<動画ID> = 指定された動画IDに移動します。<br>
                :p = 動画の再生/一時停止をトグルします。<br>
                :> = 次の動画に移動します。<br>
                :< = 先頭にシークします。<br>
                :l = "いいね！"をトグルします。<br>
                :r = リピート再生をトグルします。<br>
                :oc = "コメントリスト"タブを開きます。<br>
                :op = "動画リスト"タブを開きます。<br>
                :top = 動画トップに戻ります。<br>
                -nbu = Nicobox風UIをトグルします。<br>
                -tar = シアターUIをトグルします。<br>
                -cts = シリーズストックが有効化されている場合に、ストックへの追加をトグルします。<br>`
            } else {
                runresult = -1
            }
            return { "result": runresult, "resultstr": runresultstr }
        }
        function commanderKeyEvent(e) {
            if (e.key === 'Enter') {
                cmdACT(document.getElementById('pm-vicommander').value).then(actresult => {
                    if (actresult.result == 2) {
                        $('.pmbutton-container').append(`<div class="pm-viCommanderOutput">${actresult.resultstr}</div>`)
                        setTimeout(function () {
                            document.querySelector('.pm-viCommanderOutput').remove()
                        }, 4000)
                    } else if (actresult.result == 1 || actresult.result == 0) {
                        $('.pmbutton-container').append(`<div class="pm-viCommanderOutput">SUCCESS(${actresult.result})</div>`)
                        setTimeout(function () {
                            document.querySelector('.pm-viCommanderOutput').remove()
                        }, 4000)
                    } else {
                        $('.pmbutton-container').append('<div class="pm-viCommanderError">ERROR: Unknown Command.</div>')
                        setTimeout(function () {
                            document.querySelector('.pm-viCommanderError').remove()
                        }, 4000)
                    }
                })
                if (document.querySelector('.pm-viCommanderContainer') != undefined && document.querySelector('.pm-viCommanderContainer') != null) {
                    document.querySelector('.pm-viCommanderContainer').remove()
                }
            }
        }
        function openViCommander() {
            if (document.querySelector('.pm-viCommanderContainer') != null) {
                document.querySelector('.pm-viCommanderContainer').remove()
            } else {
                $('.pmbutton-container').append(`<div class="pm-viCommanderContainer"><input id="pm-vicommander" placeholder="exCommander(Press ENTER to submit, type 'HELP' to help)"></input></div>`)
                document.getElementById('pm-vicommander').focus()
                document.getElementById('pm-vicommander').addEventListener('keypress', commanderKeyEvent);
            }

        }
        $(document).on('keydown', shortCutAction);

        function shortCutAction(e) {
            if (e.ctrlKey || $(e.target).closest("input, textarea").length) {
                return true;
            } else if (e.key === ' ' || e.key === '　') {
                document.querySelector('.PlayerPauseButton, .PlayerPlayButton').click();
                document.querySelector(':focus-visible').blur();
                return false;
            } else if (e.key === 'ArrowLeft') {
                document.querySelector('.PlayerSeekBackwardButton').click();
                document.querySelector(':focus-visible').blur();
                return false;
            } else if (e.key === 'ArrowRight') {
                document.querySelector('.PlayerSeekForwardButton').click();
                document.querySelector(':focus-visible').blur();
                return false;
            } else if (e.key === 'c' || e.key === 'C') {
                document.querySelector('.CommentInput-textarea').focus();
                return false;
            } else if (e.key === 'h' || e.key === 'H') {
                document.querySelector('.LikeActionButton').click();
                document.querySelector(':focus-visible').blur();
                return false;
            } else if (e.key === 'Backspace') {
                if (result.excommander == true) {
                    openViCommander()
                    return false;
                }

            }
        }
    }
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        pushCSSRule(`.IchibaForWatch {
        background: var(--bgcolor2) !important;
    }
    .IchibaMain_Container .IchibaBalloon {
        background: var(--bgcolor3);
    }
    .IchibaMain_Container .IchibaBalloon::after {
        border-top: 16px solid #555;
    }
    .IchibaForWatch_Title_Body,.IchibaSuggest_Title {
        color: #fafafa;
    }
    .IchibaMainItem_Info,.IchibaSuggestItem_Info_Shop {
        color: var(--textcolor2);
    }
    .IchibaMainItem_Price_Number,.IchibaSuggestItem_Price_Number {
        color: var(--textcolor3);
    }
    .IchibaMainItem_Name,.IchibaSuggestItem_Name {
        color: #8fb9df;
    }
    .IchibaSuggestItem {    
        border: 1px solid var(--accent2);
    }`)
    }

    /*
    $(document).on('mousemove', function(e) {
        window.cursorX = e.pageX;
        window.cursorY = e.pageY;
    });*/
    if (result.usenicoboxui != true && result.usetheaterui != true) {
        if (result.watchpagetheme != "") {
            //console.log(`CSS Loaded!`);
            addCSS(chrome.runtime.getURL("style/css/watchpagetheme/" + result.watchpagetheme + ".css"));
        }
        if (result.usenicoboxui != true && result.usetheaterui != true && result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            if (result.watchpagetheme == "harazyuku") {
                pushCSSRule(`.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand, .VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse {
                    fill: var(--textcolor1);
                    color: var(--textcolor1);
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse::before {
                    border-color: transparent transparent var(--textcolor1) !important;
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchExpand::before {
                    border-color: var(--textcolor1) transparent transparent !important;
                }
                .VideoDescriptionContainer {
                    background-color: var(--bgcolor1);
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchExpand,.VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse {
                    background-image: linear-gradient(#3b3b3b,var(--bgcolor1)) !important;
                }
                .HeaderContainer .VideoOwnerInfo-gridCell {
                    background: transparent;
                    outline: 2px solid var(--accent2);
                }
                .HeaderContainer, .BottomSideContainer, .BottomMainContainer {
                    background-color: var(--bgcolor1);
                }
                .TagItem {
                    background-color: transparent;
                    border: none;
                    border-bottom: 2px solid #999;
                    border-radius: 0px;
                }
                .MainContainer-playerPanel,.VideoMenuContainer,.VideoMenuContainer, .BottomContainer, .VideoMenuContainer-areaLeft, .VideoMenuContainer-areaRight {
                    background-color: var(--bgcolor1);
                }`)
            } else if (result.watchpagetheme == "mint") {
                pushCSSRule(`.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand, .VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse {
                    fill: var(--textcolor1);
                    color: var(--textcolor1);
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse::before {
                    border-color: transparent transparent var(--textcolor1) !important
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchExpand::before {
                    border-color: var(--textcolor1) transparent transparent !important
                }
                .VideoDescriptionExpander .VideoDescriptionExpander-switchExpand,.VideoDescriptionExpander .VideoDescriptionExpander-switchCollapse {
                    background-color: transparent;
                    background: transparent;
                    color: var(--textcolor1);
                }`)
            }
            addCSS(chrome.runtime.getURL("style/css/darkmode/watch.css"));
        }
        if (result.playertheme != "") {
            //console.log(`CSS Loaded!`);
            if (result.playertheme == "rc1" || result.playertheme == "rc1plus") {
                addCSS(chrome.runtime.getURL("style/css/playertheme/rc1.css"));
            } else {
                addCSS(chrome.runtime.getURL("style/css/playertheme/" + result.playertheme + ".css"));
            }

            if (result.playertheme == "harazyuku") {
                let lastbuttonwidth = (($(".ControllerContainer-area:last-child").length - 1) * 32) + 64
                if (lastbuttonwidth - 172 != 0) {
                    //$('.VolumeBarContainer').css('right', 165 + (lastbuttonwidth - 172) )
                }
                //
                //$('.MuteVideoButton,.UnMuteVideoButton').css('right', lastbuttonwidth)
            }
            if (result.playerstyleoverride != "") {
                if (result.playerstyleoverride != "none") {
                    addCSS(chrome.runtime.getURL("style/css/playerstyle/" + result.playerstyleoverride + ".css"))
                }
                if (result.playertheme == "mint" && result.playerstyleoverride == "mint") {
                    pushCSSRule('.PlayerPauseButton,.PlayerPlayButton {background-image: linear-gradient(#232323,#171717);outline: 1px solid #1c1c1c;outline-offset: -1px;height: 34px;}.PlayerPauseButton:hover,.PlayerPlayButton:hover {background-image: linear-gradient(#2a2a2a,#1b1b1b);}.ControllerButton svg {filter: drop-shadow(0px 0px 2px rgba(0,0,0 50%)) ;}.ControllerButton:hover svg {fill:#ffffff;filter: drop-shadow(0px 0px 2px rgba(128,128,128 100%));transition:all .1s ease .1s}')
                }
                if (result.playerstyleoverride == "harazyuku" && result.playertheme != "harazyuku") {
                    pushCSSRule('.ControllerButton {top: 5px;}')
                }
                if (result.playertheme == "mint" && result.playerstyleoverride == "harazyuku") {
                    pushCSSRule('.PlayerPauseButton,.PlayerPlayButton{left: 5px}.SeekToHeadButton{left: 10px}.PlayerSeekBackwardButton{left: 15px}.MuteVideoButton,.UnMuteVideoButton {right: 95px;}')
                }
                if (result.playertheme == "harazyuku" && result.playerstyleoverride != "harazyuku") {
                    pushCSSRule('.ControllerContainer-inner { top:-3px; }.SeekBarContainer {padding-left: 120px;padding-right: 455px;}.PlayerPlayTime { right:350px; } .VolumeBarContainer { top:4px; } .PlayerRepeatOnButton,.PlayerRepeatOffButton {padding: 8px 6px !important;}')
                }
                if (result.playertheme == "harazyuku" && result.playerstyleoverride == "mint") {
                    pushCSSRule('.ControllerContainer-inner { top:-1px; } .VolumeBarContainer { top:2px; } .PlaybackRateButton,.PlayerPlayTime { top: -2px; } .PlayerRepeatOffButton {padding: 6px 4px !important;}')
                }
                if (result.playertheme == "harazyuku" && (result.playerstyleoverride == "rc1" || result.playerstyleoverride == "rc1dark")) {
                    pushCSSRule('.PlayerRepeatOffButton,.PlayerRepeatOnButton {padding: 2px 2px !important;} .SeekBarContainer {padding-left: 105px;padding-right: 455px;}')
                }
                if (result.playertheme == "harazyuku" && result.playerstyleoverride == "harazyuku") {
                    pushCSSRule('.ControllerContainer-area.ControllerContainer-area-right > button,div {background:transparent;outline: 0px;border:0px;padding:2px;} .PlaybackRateButton { padding-top: 0px; } .PlayerPlayTime { line-height: 24px; }')
                }
                if (result.playertheme == "ginza" && result.playerstyleoverride == "harazyuku") {
                    pushCSSRule(`.PlayerPlayButton,.PlayerPauseButton {
                        left: 2px
                    }
                    .MuteVideoButton, .UnMuteVideoButton {
                        right: 255px
                    }
                    .VolumeBarContainer {
                        right: 155px
                    }
                    .SeekToHeadButton {
                        left: 6px;
                    }
                    .PlayerSeekBackwardButton {
                        left: 10px;
                    }
                    .PlayerSeekForwardButton {
                        left: 14px;
                    }
                    .PlayerSkipNextButton {
                        left: 18px;
                    }
                    .PlayerPlayTime {
                        left: 155px;
                    }
                    .ControllerButton {
                        top: 6px;
                    }
                    `)
                }
                if (result.playertheme == "mint" && (result.playerstyleoverride == "rc1" || result.playerstyleoverride == "rc1dark")) {
                    pushCSSRule(`.PlayerPlayButton,.PlayerPauseButton {
                        left: 2px;
                    }
                    .SeekToHeadButton {
                        left: 6px;
                    }
                    .PlayerSeekBackwardButton {
                        left: 10px;
                    }
                    .PlayerPlayTime,.PlayerPlayTime-duration {
                        background-image: none;
                        border: 0px solid #000;
                    }
                    .ControllerContainer-area:last-child {
                        background-image: linear-gradient(#aaa, #959595);
                        box-shadow: 0px 0px 5px rgba(0,0,0,0.5);
                    }
                    `)
                }
                if (result.playertheme == "mint" && result.playerstyleoverride == "rc1") {
                    pushCSSRule(`
                    .PlayerPlayTime,.PlayerPlayTime-duration {
                        color: #000;
                        text-shadow: 0px 0px 0px #000;
                    }
                    `)
                }
                if (result.playertheme != "rc1" && (result.playerstyleoverride == "rc1" || result.playerstyleoverride == "rc1dark")) {
                    pushCSSRule(`.PlayerPlayButton,.PlayerPauseButton {
                        top:-2px !important;
                        z-index:999999;
                    }`)
                }
            } else {
                if (result.playertheme == "rc1" || result.playertheme == "rc1plus") {
                    addCSS(chrome.runtime.getURL("style/css/playerstyle/rc1.css"));
                } else {
                    addCSS(chrome.runtime.getURL("style/css/playerstyle/" + result.playertheme + ".css"));
                }
                if (result.playertheme == "mint") {
                    pushCSSRule('.PlayerPauseButton,.PlayerPlayButton {background-image: linear-gradient(#232323,#171717);outline: 1px solid #1c1c1c;outline-offset: -1px;height: 34px;}.PlayerPauseButton:hover,.PlayerPlayButton:hover {background-image: linear-gradient(#2a2a2a,#1b1b1b);}.ControllerButton svg {filter: drop-shadow(0px 0px 2px rgba(0,0,0 50%)) ;}.ControllerButton:hover svg {fill:#ffffff;filter: drop-shadow(0px 0px 2px rgba(128,128,128 100%));transition:all .1s ease .1s}')
                }
                if (result.playertheme == "harazyuku") {
                    pushCSSRule('.ControllerContainer-area:last-child > button, .ControllerContainer-area:last-child > .ControllerContainer-playerOptionContainer > button {background:transparent;outline: 0px;border:0px;} .PlaybackRateButton { padding-top: 0px; } .PlayerPlayTime { line-height: 24px; }')
                }
            }
            if (result.playertheme == "rc1" || result.playertheme == "rc1plus") {
                let centeroffset = 0
                let volumeoffset = 0
                if (result.playertheme == "rc1") {
                    centeroffset = -20
                    volumeoffset = 15
                    pushCSSRule(`.PlayerRepeatOnButton,.PlayerRepeatOffButton,.CommentOnOffButton,.EnableFullScreenButton,.DisableFullScreenButton,.PlayerOptionButton {
                        background:transparent;
                        border: 0px;
                    }
                    .ControllerButton.PlayerRepeatOnButton svg path,.CommentOnOffButton svg,.EnableFullScreenButton svg,.DisableFullScreenButton svg,.PlayerOptionButton svg,.PlaybackRateButton svg  {
                        fill: #494949 !important;
                    }
                    .PlayerSkipNextButton {
                        display:none;
                    }
                    .VolumeBarContainer {
                        width: 66px;
                    }
                    .VolumeBarContainer {
                        position: absolute;
                        right: ${195 + volumeoffset}px;
                    }
                    .PlayerRepeatOnButton,.PlayerRepeatOffButton,.CommentOnOffButton,.EnableFullScreenButton,.PlayerOptionButton {
                        margin-right: 8px;
                        height:30px;
                        width:30px;
                    }
                    .PlayerRepeatOnButton,.PlayerRepeatOffButton,.CommentOnOffButton,.EnableFullScreenButton,.DisableFullScreenButton,.PlayerOptionButton {
                        top:3px;
                        padding:3px !important;
                    }
                    `)

                }
                pushCSSRule(`
                .VolumeBarContainer {
                    position: absolute;
                    right: ${185 + volumeoffset}px;
                }
                .MuteVideoButton,.UnMuteVideoButton {
                    position: absolute !important;
                    right: ${275 + volumeoffset}px;
                }
                .PlayerSkipNextButton {
                    position: absolute !important;
                    right: ${310 + centeroffset}px;
                }
                .PlayerSeekForwardButton {
                    position: absolute !important;
                    right: ${343 + centeroffset}px;
                }
                .PlayerPlayTime {
                    position:absolute;
                    right: ${380 + centeroffset}px;
                }
                .SeekBarContainer {
                    padding-left: 113px;
                    padding-right: ${486 + centeroffset}px;
                    padding-top: 0px;
                    position: relative;
                    height:1px
                }
                `)
            }
            if (result.playertheme == "rc1" && result.playerstyleoverride == "rc1dark") {
                pushCSSRule(`.ControllerButton.PlayerRepeatOnButton svg path,.CommentOnOffButton svg,.EnableFullScreenButton svg,.DisableFullScreenButton svg,.PlayerOptionButton svg,.PlaybackRateButton svg  {
                    fill: #aaa !important;
                }`)
            }
            if (result.playertheme == "rc1" && result.playerstyleoverride == "harazyuku") {
                pushCSSRule(`.ControllerButton.PlayerRepeatOnButton svg path,.CommentOnOffButton svg,.EnableFullScreenButton svg,.DisableFullScreenButton svg,.PlayerOptionButton svg,.PlaybackRateButton svg  {
                    fill: #fff !important;
                }
                .PlayerRepeatOnButton,.PlayerRepeatOffButton,.CommentOnOffButton,.EnableFullScreenButton,.DisableFullScreenButton,.PlayerOptionButton {
                    outline: none;
                }
                `)
            }
        }
        if (result.hidepopup == true) {
            // cssじゃないとロードの都合で反映されなかった
            //$('.FollowAppeal,.SeekBarStoryboardPremiumLink-content,.PreVideoStartPremiumLinkContainer').css('display','none')
            addCSS(chrome.runtime.getURL("style/css/hide/hidepopup.css"));
        }
    } else if (result.usenicoboxui == true && result.useoldnicoboxstyle != true) {
        // New Nicobox UI
        if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            addCSS(chrome.runtime.getURL("style/css/darkmode/watch.css"));
            pushCSSRule(`.ControllerButton svg,.ControllerButton.PlayerRepeatOnButton svg path,.PlaybackRateButton svg {
                fill: #fff
            }`)
            $('html').css({
                '--nb-bgcolor': 'var(--bgcolor1)'
            })
        } else {
            $('html').css({
                '--nb-bgcolor': '#f6f6f6'
            })
        }
        $('body').addClass('is-PMNewNicoboxUI')
        addCSS(chrome.runtime.getURL("style/css/nicobox-new.css"));
        $('body').css('background-color', '#fefefe')
        // 基本レイアウト変更
        pushCSSRule('.MainContainer-floatingPanel {position: fixed;right: 0;bottom: 0;top: 44px;z-index: 500;}')

        $(function () {
            chrome.runtime.sendMessage({ "type": "getThumbXml", "smID": location.pathname.slice(7) }).then(res => {
                // why chrome can't use domparser in service worker...
                //console.log(res)
                let domparser = new DOMParser()
                let parsedxml = domparser.parseFromString(res, "text/xml");
                //console.log(parsedxml)
                let thumburl = parsedxml.querySelector("thumbnail_url").textContent
                $('html').css({
                    '--thumburl': "url(" + thumburl + ")",
                })
            })
            $('.VideoMetaContainer .VideoViewCountMeta').on('DOMSubtreeModified propertychange', function () {
                chrome.runtime.sendMessage({ "type": "getThumbXml", "smID": location.pathname.slice(7) }).then(res => {
                    //console.log(res)
                    let domparser = new DOMParser()
                    let parsedxml = domparser.parseFromString(res, "text/xml");
                    //console.log(parsedxml)
                    let thumburl = parsedxml.querySelector("thumbnail_url").textContent
                    $('html').css({
                        '--thumburl': "url(" + thumburl + ")",
                    })
                })
            });
            $('.SeekBar').before($('.PlayerPlayTime-playtime'));
            $('.SeekBar').after($('.PlayerPlayTime-duration'));
            // 不要な要素の削除
            $('.MainContainer-marquee, .ControllerBoxCommentAreaContainer, .CommentRenderer, .PlayerPlayTime-separator,.BottomContainer,.EasyCommentContainer-buttonBox').remove();
            window.scroll({ top: 0, behavior: 'smooth' });
            if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                pushCSSRule(`
                    .VideoDescriptionExpander .VideoDescriptionExpander-switchExpand {background: linear-gradient(90deg,hsla(0,0%,96%,0),var(--bgcolor1) 16%)}
                    .SeekBar-played, .SeekBarHandle-handle, .VolumeBar-progress { background-color: #fff}
                    .VideoTitle {color: var(--textcolor1)}
                `)
            } else {
                pushCSSRule(`
                .HeaderContainer {
                    background: #f6f6f6
                }
                .PlayerPlayTime {
                    color: #1d2128
                }
                .SeekBar-played, .SeekBarHandle-handle, .VolumeBar-progress {
                    background-color: #22f5dc
                }
                .VideoTitle {
                    color: #10101f
                }
                `)
            }
        });
    } else if (result.usenicoboxui == true && result.useoldnicoboxstyle == true) {
        // Nicobox UI
        $('body').addClass('is-PMNicoboxUI')
        if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            addCSS(chrome.runtime.getURL("style/css/darkmode/watch.css"));
            pushCSSRule(`.ControllerButton svg,.ControllerButton.PlayerRepeatOnButton svg path,.PlaybackRateButton svg {
                fill: #fff
            }`)
        }
        addCSS(chrome.runtime.getURL("style/css/nicobox.css"));
        $('body').css('background-color', '#fefefe')
        // 基本レイアウト変更
        //nicobox.cssに移動
        pushCSSRule('.MainContainer-floatingPanel {position: fixed;right: 0;bottom: 0;top: 44px;z-index: 500;}')

        $(function () {
            $('.SeekBar').before($('.PlayerPlayTime-playtime'));
            $('.SeekBar').after($('.PlayerPlayTime-duration'));
            // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
            // かつてヘッダーだったもの(動画情報)
            $('.HeaderContainer-row > .GridCell.col-full').removeClass('col-full')
            $('.SearchBox-optionDown').text('▲')
            // 不要な要素の削除
            $('.MainContainer-marquee, .ControllerBoxCommentAreaContainer, .CommentRenderer, .PlayerPlayTime-separator,.BottomContainer,.EasyCommentContainer-buttonBox').remove();
            window.scroll({ top: 0, behavior: 'smooth' });
            if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                pushCSSRule('.VideoDescriptionExpander .VideoDescriptionExpander-switchExpand {background: linear-gradient(90deg,hsla(0,0%,96%,0),var(--bgcolor1) 16%);}')
            } else {
                pushCSSRule('.HeaderContainer {background: #fefefe;} .PlayerPlayTime { color: #1d2128; }')
            }
        });
    } else {
        // theater UI
        $('body').css('background-color', '#000')
        $('body').addClass('is-PMTheaterUI')
        // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
        // video関連は早めにスタイルシートで書かないとコメントコンテナーやシンボルが動画サイズの変更を反映してくれない
        //addCSS(chrome.runtime.getURL("style/css/theater_video.css"));
        // 基本レイアウト変更
        // theater.cssに移動
        pushCSSRule('.MainContainer-floatingPanel {position: fixed;right: 0;bottom: 0;top: 44px;z-index: 500;}.common-header-1v0m9lc, .common-header-1nvgp3g, .common-header-h0l8yl, .common-header-cdesjj, .common-header-171vphh, .common-header-wb7b82, .common-header-1ufbzdh, .common-header-654o26, .common-header-11u4gc2, .common-header-1pxv7y0, .commonHeaderArea, #CommonHeader {background-color: #000 !important;}')
        if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            addCSS(chrome.runtime.getURL("style/css/darkmode/watch.css"));
            document.documentElement.classList.add('PM-TheaterMode')
        } else {
            document.documentElement.classList.add('PM-TheaterMode')
        }
        if ( !result.disabletheaterpalette ) {
            document.documentElement.classList.add('PM-TheaterUseBlack')
        }

        $(function () {
            $('.SeekBar').before($('.PlayerPlayTime-playtime'));
            $('.SeekBar').after($('.PlayerPlayTime-duration'));
            $('.VideoTitle').after($('.SeriesBreadcrumbs'));
            $('.PlayerPanelContainer').append($('.HeaderContainer-searchBox'));
            $('.HeaderContainer-row > .GridCell.col-full').removeClass('col-full')
            $('.SearchBox-optionDown').text('▲')
            $('.PlayerPanelContainer').css('border-top-left-radius', '16px')
            // 不要な要素の削除
            $('.MainContainer-marquee, .PlayerPlayTime-separator, .EasyCommentContainer-buttonBox').remove();
            window.scroll({ top: 0, behavior: 'smooth' });
        });
    }
    //console.log(`createCSSRule Finished!`)
}

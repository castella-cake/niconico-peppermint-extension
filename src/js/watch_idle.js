getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.enableseriesstock == true) {
        let seriesBC = document.querySelector('.SeriesBreadcrumbs')
        let seriesBCTitle = document.querySelector('.SeriesBreadcrumbs-title')
        $('.pmbutton-container').prepend('<div class="addtostock-container subaction-container"><a id="addtostock" class="material-icons-outlined subaction-button">add</a></div>')
        function updateStockUI() {
            seriesBCTitle = document.querySelector('.SeriesBreadcrumbs-title')
            // タイトルの下にあるシリーズを表示するやつがあるか。動画にシリーズがないなら、これは存在しない
            console.log(seriesBCTitle)
            if (seriesBCTitle != null) {
                $('#addtostock').removeClass('disabled')
                seriesIsStocked(seriesBCTitle.href.slice(32))
                    .then(result => {
                        if (result) {
                            $('#addtostock').text("remove")
                        } else {
                            $('#addtostock').text("add")
                        }
                        //console.log(result)
                    }).catch(error => {
                        //console.log(error);
                    });
                document.getElementById('addtostock').addEventListener('click', addCurrentSeriesToStock)
            } else {
                document.getElementById('addtostock').removeEventListener('click', addCurrentSeriesToStock)
                $('#addtostock').addClass('disabled')
            }
        }
        function updateStockVidInfo() {
            seriesBCTitle = document.querySelector('.SeriesBreadcrumbs-title')
            if (seriesBCTitle != null) {
                let currentVidSeriesID = seriesBCTitle.href.slice(32)
                let currentVidSeriesName = seriesBCTitle.textContent
                // シリーズにあるかどうかを見るために、ストック中のシリーズを取得する
                chrome.storage.sync.get(["stockedseries"]).then((stockdata) => {
                    // pathnameで /watch/sm.... が取得できるので、7文字切ってsm...だけ取得する
                    let smID = location.pathname.slice(7)
                    let stockedseriesarray = stockdata.stockedseries
                    // シリーズ要素のhrefで https://www.nicovideo.jp/series/1234... を取得できるので、32文字切ってシリーズIDを取得する
                    $.each(stockedseriesarray, function (i, object) {
                        if (object.seriesID == currentVidSeriesID) {
                            //console.log(`current series! ${smID}`)
                            object.lastVidID = smID
                            object.lastVidName = document.querySelector('.VideoTitle').textContent
                            //console.log($('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').prop('href'))
                            // 概要欄が開かれていない場合、.VideoDescriptionExpander-switch という要素に VideoDescriptionExpander-switchExpand というクラスが着く = nullではなくなる
                            if (document.querySelector('.VideoDescriptionExpander-switchExpand') != null) {
                                // 概要欄から読み取るので、概要欄が開かれてないときは一瞬開いて読み取る
                                $('.VideoDescriptionExpander-switch').trigger('click');
                                if (document.querySelector('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle') != null) {
                                    // 概要欄のシリーズ表示にある、「次の動画」のhrefを31文字切る。hrefはこういう形式(https://www.nicovideo.jp/watch/sm123456?ref=pc_watch_description_series)
                                    // なので、31文字切って不要なゴミトラッキング情報を消し飛ばす
                                    object.nextVidID = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').prop('href').slice(31).replace(/\?.*/, '')
                                    object.nextVidName = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').text()
                                }
                                $('.VideoDescriptionExpander-switch').trigger('click');
                            } else {
                                if (document.querySelector('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle') != null) {
                                    object.nextVidID = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').prop('href').slice(31).replace(/\?.*/, '')
                                    object.nextVidName = $('.VideoDescriptionSeriesContainer-nextArea .VideoDescriptionSeriesContainer-itemTitle').text()
                                }
                            }
                            //console.log(object)
                        }
                    })
                    chrome.storage.sync.set({
                        "stockedseries": stockedseriesarray
                    })
                })
            }
        }
        function addCurrentSeriesToStock() {
            seriesBCTitle = document.querySelector('.SeriesBreadcrumbs-title')
            manageSeriesStock(seriesBCTitle.href.slice(32), seriesBCTitle.textContent)
            .then(result => {
                //console.log(result)
                if (result) {
                    $('#addtostock').text("remove")
                    $("#addtostock-text").text("シリーズをストックから削除")
                    updateStockVidInfo()
                } else {
                    $('#addtostock').text("add")
                    $("#addtostock-text").text("シリーズをストックに追加")
                }
            }).catch(error => {
                onError(error);
            });
        }
        updateStockUI()
        updateStockVidInfo()
        // ニコニコは動画リンクを踏んだ時実際にはページを移動していないので、メタの変更で検知する
        $('.VideoMetaContainer').on('DOMSubtreeModified propertychange', function () {
            console.log(`Video changed!!`)
            updateStockUI()
            updateStockVidInfo()
        });
        console.log(document.querySelector('.HeaderContainer-topAreaLeft'))
        const titleContainer = document.querySelector('.HeaderContainer-topAreaLeft')
        const titleContainerObserver = new MutationObserver(records => {
            updateStockUI()
        })
        titleContainerObserver.observe(titleContainer, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        })
        document.getElementById('addtostock').addEventListener('mouseenter', function () {
            seriesBCTitle = document.querySelector('.SeriesBreadcrumbs-title')
            if (seriesBCTitle != null) {
                seriesIsStocked(seriesBCTitle.href.slice(32))
                .then(result => {
                    if (document.querySelector('#addtostock-text') == null) {
                        if (result) {
                            $('#addtostock').text("remove")
                            $('.addtostock-container').append('<span id="addtostock-text" class="pmui-hinttext">シリーズをストックから削除</span>')
                        } else {
                            $('#addtostock').text("add")
                            $('.addtostock-container').append('<span id="addtostock-text" class="pmui-hinttext">シリーズをストックに追加</span>')
                        }
                    }
                    //console.log(result)
                }).catch(error => {
                    //console.log(error);
                });
            } else {
                $('#addtostock').text("add")
                $('.addtostock-container').append('<span id="addtostock-text" class="pmui-hinttext">この動画にはシリーズがありません</span>')
            }
        })
        document.getElementById('addtostock').addEventListener('mouseleave', function () {
            if (document.getElementById('addtostock-text') != null) {
                document.getElementById('addtostock-text').remove()
            }
        })
    }
    if (result.replacemarqueecontent == "ranking" && result.usenicoboxui != true && result.usetheaterui != true) {
        $(function () {
            if (!(result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches))) {
                pushCSSRule(`#pm-marqueerankinglink {color: #fafafa}`)
            }
            if ((result.playertheme == "rc1" && result.playerstyleoverride != "rc1dark") || result.playerthemeoverride == "rc1") {
                pushCSSRule(`#pm-marqueerankinglink {color: #000}`)
            }
            if (result.playerstyleoverride == "rc1dark") {
                pushCSSRule('#pm-marqueerankinglink {color: #fafafa} #pm-marqueerankingbg {color: #aaa}')
            }
            $('.Marquee-itemArea,.Marquee-buttonArea').remove()
            chrome.runtime.sendMessage({ "type": "getRankingXml" }).then(res => {
                // why chrome can't use domparser in service worker...
                //console.log(res)
                let domparser = new DOMParser()
                let parsedxml = domparser.parseFromString( res, "text/xml" );
                //console.log(parsedxml)
                let xmlcontent = parsedxml.querySelectorAll("channel item")
                //console.log(xmlcontent[0].querySelector('title').textContent)
                if (document.querySelector('.Marquee-itemArea,.Marquee-buttonArea') != null) {
                    $('.Marquee-itemArea,.Marquee-buttonArea').remove()
                }
                let xmlloop = 0
                $('.MarqueeContainer > div').append(`<div id="pm-marqueerankingbg"></div>`)
                $('#pm-marqueerankingbg').append(`<div id="pm-marqueerankingbg-current">${xmlloop + 1}</div>`)
                $('.MarqueeContainer > div').append(`<a id="pm-marqueerankinglink" href="${xmlcontent[xmlloop].querySelector('link').textContent}" target="_blank" rel="noopener noreferrer">${xmlcontent[xmlloop].querySelector('title').textContent}</div>`)
                if (xmlloop + 1 >= xmlcontent.length) {
                    $('#pm-marqueerankingbg').append('<div id="pm-marqueerankingbg-next">1</div>')
                } else {
                    $('#pm-marqueerankingbg').append(`<div id="pm-marqueerankingbg-next">${xmlloop + 2}</div>`)
                }
                //console.log(xmlcontent.length)
                setTimeout(function() {
                    $('#pm-marqueerankingbg-current').css('animation', 'marqueebganim_1 0.5s linear forwards')
                    $('#pm-marqueerankingbg-next').css('animation', 'marqueebganim_2 0.8s linear forwards')
                }, 4200)
                setTimeout(function() {
                    $('#pm-marqueerankinglink').css('animation', 'fadeout 0.2s linear forwards')
                }, 4500)
                xmlloop = 1
                setInterval(function() {
                    setTimeout(function() {
                    if(document.querySelector('#pm-marqueerankinglink') != null) {
                        $('#pm-marqueerankingbg-current').remove()
                        $('#pm-marqueerankingbg-next').remove()
                        $('#pm-marqueerankinglink').remove()
                    }
                    $('#pm-marqueerankingbg').append(`<div id="pm-marqueerankingbg-current">${xmlloop + 1}</div>`)
                    $('.MarqueeContainer > div').append(`<a id="pm-marqueerankinglink" href="${xmlcontent[xmlloop].querySelector('link').textContent}" target="_blank" rel="noopener noreferrer">${xmlcontent[xmlloop].querySelector('title').textContent}</div>`)
                    if (xmlloop + 1 >= xmlcontent.length) {
                        $('#pm-marqueerankingbg').append('<div id="pm-marqueerankingbg-next">1</div>')
                    } else {
                        $('#pm-marqueerankingbg').append(`<div id="pm-marqueerankingbg-next">${xmlloop + 2}</div>`)
                    }
                    xmlloop++
                    if (xmlloop >= xmlcontent.length) {
                        xmlloop = 0
                    }
                    }, 100)
                    setTimeout(function() {
                        $('#pm-marqueerankingbg-current').css('animation', 'marqueebganim_1 0.5s linear forwards')
                        $('#pm-marqueerankingbg-next').css('animation', 'marqueebganim_2 0.8s linear forwards')
                    }, 4200)
                    setTimeout(function() {
                        $('#pm-marqueerankinglink').css('animation', 'fadeout 0.2s linear forwards')
                    }, 4500)
                }, 5000);
            })
        })
    } else if (result.replacemarqueecontent == "blank" || result.replacemarqueecontent == "logo") {
        pushCSSRule('.Marquee-itemArea,.Marquee-buttonArea {display:none;}')
    }
    if (result.usenicoboxui != true && result.usetheaterui == true) {
        // theater UI fallback and wait load without jquery
        addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        addCSS(chrome.runtime.getURL("pagemod/css/header/black.css"));
        // TODO: シリーズストックのものと統合する
        const metaContainer = document.querySelector('.VideoMetaContainer')
        const metaContainerObserver = new MutationObserver(records => {
            if (document.querySelector('.SeriesBreadcrumbs') != null) {
                document.querySelector('.VideoTitle').after(document.querySelector('.SeriesBreadcrumbs'));
            }
        })
        metaContainerObserver.observe(metaContainer, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        })
    }
    if (result.usenicoboxui == true || result.usetheaterui == true) {
        let headercontainer = document.querySelector('.HeaderContainer')
        let maincontainer = document.querySelector('.MainContainer')
        let watchappcontainer = document.querySelector('.WatchAppContainer-main')
        let playerpanelcontainer = document.querySelector('.MainContainer-playerPanel')
        //console.log(headercontainer)
        //console.log(maincontainer)

        //headercontainer.insertBefore(maincontainer)
        watchappcontainer.insertBefore(maincontainer,headercontainer)
        //$('.HeaderContainer').before($('.MainContainer'));
        watchappcontainer.after(playerpanelcontainer)
        if (document.querySelector('.WakutkoolNoticeContainer') != null) {
            watchappcontainer.insertBefore(document.querySelector('.WakutkoolNoticeContainer'),maincontainer)
        }
        if (document.querySelector('.EditorMenuContainer') != null) {
            watchappcontainer.insertBefore(document.querySelector('.EditorMenuContainer'),maincontainer)
        }
        pushCSSRule('.VideoLiveTimeshiftContainer{text-align:center}')
        $(function () {
            function ContainerResize(e) {
                //console.log('VideoSymbolContainer resized!')
                $('.CommentRenderer').css({
                    'width': $('.VideoContainer').width() + "px",
                    'height': $('.VideoContainer').height() + "px",
                })
                $('.VideoSymbolContainer').css({
                    'width': $(e).width() + "px",
                    'height': $(e).height() + "px",
                })
                let fontsize = $(e).height() / 24
                let width = $(e).width()
                let height = $(e).height()
                $('.SupporterView-content').css({
                    'width': width + "px",
                    'height': height + "px",
                    'font-size': fontsize + "px"
                })
            }
            if (document.querySelector('.VideoContainer') != null) {
                // theater and Nicobox UI
                ContainerResize(document.querySelector('.MainVideoPlayer video'))
                //document.querySelector('.MainVideoPlayer video').addEventListener('canplay propertychange', ContainerResize)
            }
            function changeNoPanelUI(control) {
                if (control) {
                    $('.WatchAppContainer-main').css({
                        'width': '100%',
                        'left': '0',
                        'margin': '0',
                        'padding': '0px 0px'
                    })
                    $('.MainVideoPlayer video').css({
                        'max-width': '100vw'
                    })
                    $('.VideoContainer').css({
                        'width': '100vw'
                    })
                    $('.HeaderContainer-searchBox').css('display', 'none')
                    ContainerResize(document.querySelector('.MainVideoPlayer video'))
                    $('.VideoTitle').css({
                        'position': 'fixed',
                        'left': '0',
                        'top': '0',
                        'z-index': '6000010',
                        'padding-left': '6px',
                        'padding-top': '8px',
                        'font-size': '14px',
                        'max-width': '360px',
                        'text-align': 'left',
                        'overflow': 'hidden',
                        'text-overflow': 'ellipsis'
                    })
                    $('.SeriesBreadcrumbs').css({
                        'position': 'fixed',
                        'right': '0',
                        'top': '0',
                        'z-index': '6000010',
                        'padding-right': '6px',
                        'padding-top': '2px',
                        'font-size': '14px',
                        'max-width': '360px',
                        'text-align': 'right',
                        'overflow': 'hidden',
                        'text-overflow': 'ellipsis'
                    })
                } else {
                    $('.WatchAppContainer-main').css({
                        'width': 'calc( 100% - 384px )',
                        'left': '0',
                        'margin': '0',
                        'padding': '0px 0px'
                    })
                    $('.MainVideoPlayer video').css({
                        'max-width': 'calc(100vw - 384px)'
                    })
                    $('.VideoContainer').css({
                        'width': 'calc(100vw - 384px)'
                    })
                    $('.HeaderContainer-searchBox').css('display', 'inherit')
                    ContainerResize(document.querySelector('.MainVideoPlayer video'))
                    $('.VideoTitle').css({
                        'position': '',
                        'left': '',
                        'top': '',
                        'z-index': '',
                        'padding-left': '',
                        'padding-top': '',
                        'font-size': '',
                        'max-width': '',
                        'text-align': '',
                        'overflow': '',
                        'text-overflow': ''
                    })
                    $('.SeriesBreadcrumbs').css({
                        'position': '',
                        'right': '',
                        'top': '',
                        'z-index': '',
                        'padding-right': '',
                        'padding-top': '',
                        'font-size': '',
                        'max-width': '',
                        'text-align': '',
                        'overflow': '',
                        'text-overflow': ''
                    })
                }
            }

            // first
            if ($('.MainContainer-playerPanel').css('display') == 'none') {
                changeNoPanelUI(true)
            }

            // playerpanel style changed
            const playerpanel = document.querySelector('.MainContainer-playerPanel')
            const supporterview = document.querySelector('.SupporterView-content')
            const observer = new MutationObserver(records => {
                if ($('.MainContainer-playerPanel').css('display') == 'none') {
                    changeNoPanelUI(true)
                } else {
                    changeNoPanelUI(false)
                }
                /*if ($('.SupporterView-content').css('width') != $('.VideoContainer').width() ) {
                    let fontsize = $('video').height() / 13
                    let width = $('.VideoContainer').width()
                    let height = $('.VideoContainer').height()
                    $('.SupporterView-content').css({
                        'width': width + "px",
                        'height': height + "px",
                        'font-size': fontsize + "px"
                    })
                }*/
            })
            observer.observe(playerpanel, {
                attributeFilter: ['style']
            })
            //observer.observe(supporterview, {
                //attributeFilter: ['style']
            //})
        })
    }


    if (result.usenicoboxui != true && result.usetheaterui != true) {
        // harazyuku dynamic volbar width
        $(function () {
            if (result.playertheme == "harazyuku") {
                function updateOffset() {
                    console.log('Offset Changed!')
                    let lastarea = document.querySelectorAll(".ControllerContainer-area")[2]
                    // (子要素数 - 1(再生速度ボタン)) * 24(通常ボタンwidth) + 64(再生速度ボタンwidth)
                    let lastareawidth = ((lastarea.childElementCount - 1) * 27) + 64
                    //console.log(lastareawidth)
                    //console.log(lastarea.childElementCount)
                    let rightoffset = lastareawidth - 172
                    //console.log(rightoffset)
                    if (rightoffset > 0) {
                        volwidth = 80 - rightoffset
                        rightoffset += 165
                        //console.log(rightoffset)
                        //console.log(volwidth)
                        document.querySelector('.VolumeBarContainer').style = `right: ${rightoffset}px; width: ${volwidth}px`
                    } else {
                        document.querySelector('.VolumeBarContainer').style = ``
                    }
                }
                updateOffset()
                const ctrllastchild = document.querySelectorAll(".ControllerContainer-area")[2]
                const observer = new MutationObserver(records => {
                    updateOffset()
                })
                observer.observe(ctrllastchild, {
                    childList: true,
                    subtree: true
                })
            }
            if (result.playertheme == "rc1plus") {
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = document.querySelectorAll(".ControllerContainer-area")[2].clientWidth
                    //console.log($(".ControllerContainer-area:last-child").width())
                    let rightoffset = lastareawidth - 192
                    //console.log(rightoffset)
                    if (rightoffset > 0) {
                        volwidth = 80 - rightoffset
                        if (result.playertheme == "rc1") {
                            rightoffset += 192
                        } else {
                            rightoffset += 185
                        }
                        document.querySelector('.VolumeBarContainer').style = `right: ${rightoffset}px; width: ${volwidth}px`
                    } else {
                        document.querySelector('.VolumeBarContainer').style = ``
                    }
                }
                updateOffset()
                const ctrllastchild = document.querySelector(".ControllerContainer")
                const observer = new MutationObserver(records => {
                    updateOffset()
                })
                observer.observe(ctrllastchild, {
                    childList: true,
                    subtree: true
                })
            }

            if (result.playertheme == "mint") {
                function updateOffset() {
                    console.log('Offset Changed!')
                    let lastarea = document.querySelectorAll(".ControllerContainer-area")[2]
                    // (子要素数 - 1(再生速度ボタン)) * 32(通常ボタンwidth) + 64(再生速度ボタンwidth)
                    let lastareawidth = ((lastarea.childElementCount - 1) * 32) + 60
                    if (lastareawidth > 172) {
                        pushCSSRule(`.ControllerContainer-area:last-child:hover {
                            width: ${lastareawidth}px;
                            transition: width 0.3s ease;
                        }`)
                    }
                }
                updateOffset()
                const ctrllastchild = document.querySelectorAll(".ControllerContainer-area")[2]
                const observer = new MutationObserver(records => {
                    updateOffset()
                })
                observer.observe(ctrllastchild, {
                    childList: true,
                    subtree: true
                })
            }
        })
    }
}
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.replacemarqueecontent == "ranking") {
        $(function () {
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
        // theater UI fallback
        addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        addCSS(chrome.runtime.getURL("pagemod/css/header/black.css"))
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
        $('.VideoLiveTimeshiftContainer').css('text-align', 'center')
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
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
                    //console.log($(".ControllerContainer-area:last-child").width())
                    let rightoffset = lastareawidth - 172
                    //console.log(rightoffset)
                    if (rightoffset > 0) {
                        volwidth = 80 - rightoffset
                        rightoffset += 165
                        rightoffset = rightoffset + 'px'
                        //console.log(rightoffset)
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    }
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })
            }
            if (result.playertheme == "rc1" || result.playertheme == "rc1plus") {
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
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
                        
                        rightoffset = rightoffset + 'px'
                        //console.log(rightoffset)
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    }
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })
            }
            if (result.playertheme == "mint") {
                /* 後回し
                function updateOffset() {
                    //alert('Offset Changed!')
                    let lastareawidth = $(".ControllerContainer-area:last-child").width()
                    //console.log( $(".ControllerContainer-area:last-child").width() )
                    let rightoffset = lastareawidth - 172
                    //console.log( rightoffset )
                    if ( rightoffset > 0 ) {
                        volwidth = 80 - rightoffset
                        rightoffset += 165
                        rightoffset = rightoffset + 'px'
                        //console.log( rightoffset )
                        $('.VolumeBarContainer').css({
                            'right': rightoffset,
                            'width': volwidth
                        })
                    } 
                }
                updateOffset()
                const ctrllastchild = document.querySelector('.ControllerContainer-area:last-child')
                const observer = new MutationObserver(records => {
                    updateOffset()    
                })
                observer.observe(ctrllastchild, {
                    childList: true
                })*/
            }
        })
    }
}
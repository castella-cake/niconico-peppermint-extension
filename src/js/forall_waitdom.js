// www.nicovideo.jpの全てで実行

if ( document.querySelector('.pmbutton-container') == undefined || document.querySelector('.pmbutton-container') == null ) {
    let pmbuttoncontainer = document.createElement('div')
    pmbuttoncontainer.classList.add('pmbutton-container')
    document.body.appendChild(pmbuttoncontainer)
}
//$('body').append('<div class="version-watermark" style="position: sticky; left:0; bottom:0px;color:#aaa;font-size:8px">Niconico-PepperMint Preview</div>');
addCSS("https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined")
addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui.css"));
if (document.getElementById('peppermint-css') == null || document.getElementById('peppermint-css') == undefined) {
    let html = document.querySelector('html');
    let peppermintStyle = document.createElement('style')
    peppermintStyle.id = "peppermint-css"
    html.appendChild(peppermintStyle)
} else {
    let html = document.querySelector('html');
    let peppermintStyle = document.getElementById('peppermint-css')
    html.appendChild(peppermintStyle)
}

getStorageData.then(createBaseCSSRule, onError);
function createBaseCSSRule(result) {
    $(function() {
        if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
            if (result.darkmode == 'custom' && result.customcolorpalette != undefined) {
                pushCSSRule(`:root{--bgcolor1:${result.customcolorpalette.bgcolor1};--bgcolor2:${result.customcolorpalette.bgcolor2};--bgcolor3:${result.customcolorpalette.bgcolor3};--bgcolor4:${result.customcolorpalette.bgcolor4};--textcolor1:${result.customcolorpalette.textcolor1};--textcolor2:${result.customcolorpalette.textcolor2};--textcolor3:${result.customcolorpalette.textcolor3};--textcolornew:${result.customcolorpalette.textcolornew};--accent1:${result.customcolorpalette.accent1};--accent2:${result.customcolorpalette.accent2};--hover1:${result.customcolorpalette.hover1};--hover2:${result.customcolorpalette.hover2};--linktext1:${result.customcolorpalette.linktext1};--linktext2:${result.customcolorpalette.linktext2};--linktext3:${result.customcolorpalette.linktext3};--nicoru1:${result.customcolorpalette.nicoru1};--nicoru2:${result.customcolorpalette.nicoru2};--nicoru3:${result.customcolorpalette.nicoru3};--nicoru4:${result.customcolorpalette.nicoru4};}`)
            } else {
                //addCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"));
            }
            if ( location.hostname != "game.nicovideo.jp" && location.hostname != "qa.nicovideo.jp" && location.hostname != "www.upload.nicovideo.jp" ) {
                //addCSS(chrome.runtime.getURL("pagemod/css/darkmode/all.css"), true);
                document.body.classList.add('is-PMDarkPalette')
            }
            if (result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) {
                $('.NiconicoLogo_black').addClass('NiconicoLogo_white')
                $('.NiconicoLogo_black').removeClass('NiconicoLogo_black')
                $('.NicovideoLogo[data-color="black"]').attr('data-color',"white")
            }
            document.documentElement.classList.remove('PMDM-Assist')
            //addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true, `link[href="${chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css")}"]`, 'before')
        } else { addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true) }


        if (result.headerbg == "gradient") {
            document.documentElement.classList.add('PM-HeaderBG-Custom')
            $('html').css('--headercolor', "linear-gradient(#2d2d2d, #000000)");
        } else if (result.headerbg == "custom") {
            document.documentElement.classList.add('PM-HeaderBG-Custom')
            $('html').css('--headercolor', result.headercolor);
            //console.log(`HeaderBG changed to ${result.headercolor}`);
        }


        if ( result.enableseriesstock == true && result.showseriesstockinpage == true && ( (location.pathname == "/" && location.hostname == "www.nicovideo.jp") || (location.pathname.indexOf('/video_top') != -1 && location.hostname == "www.nicovideo.jp") ) ){
            $('.pmbutton-container').append('<div class="openstock-container"><button id="openstock" class="material-icons mainaction-button" style="background: #00796b">folder</button></div>')
            $('#openstock').on('mouseenter', function() {
                $('#openstock').css({
                    'font-size':'28px',
                    'transition':'all .1s'
                })
                $('.openstock-container').append('<span id="openstock-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%); color: #000;">ストック中のシリーズ</span>')
            })
            $('#openstock').on('mouseleave', function() {
                $('#openstock').css({
                    'font-size':'24px',
                    'transition':'all .1s'
                })
                $('#openstock-text').remove()
            })
            $('#openstock').on('click', function () {
                //console.log(document.querySelector('.stockedserieswindow-container') != null)
                if (document.querySelector('.stockedserieswindow-container') != null) {
                    $('.stockedserieswindow-container').remove()
                } else {
                    // <button id="togglelock" class="togglelock">ロック解除</button>
                    $('.openstock-container').before('<div class="stockedserieswindow-container"><div>ストック中のシリーズ<button id="togglelock" class="togglelock">ロック解除</button></div><div class="stockedserieslist-container"></div></div>')
                    var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
                    getNewStorageData.then(function (newresult) {
                        $.each(newresult.stockedseries, function (i, object) {
                            let seriesHref = `https://www.nicovideo.jp/series/${object.seriesID}`
                            // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
                            // 内容はJSONで、Base64でエンコードします
                            let playlist = btoa(`{"type":"series","context":{"seriesId":${object.seriesID}}}`)
                            // create row container dom
                            let elem = document.createElement('div')
                            elem.id = object.seriesID
                            elem.classList.add('stockedseries-row')

                            // create serieslink container
                            let linkcontainer = document.createElement('div')
                            linkcontainer.classList.add('serieslink-container')

                            // create link
                            let link = document.createElement('a')
                            link.classList.add('stockedseries-row-link')
                            link.setAttribute('href',seriesHref)
                            link.textContent = object.seriesName
                            linkcontainer.appendChild(link)
                            // create remove button
                            let removebutton = document.createElement('button')
                            removebutton.id = 'removeseries'
                            removebutton.textContent = '削除'
                            linkcontainer.appendChild(removebutton)
                            // push to row container
                            elem.appendChild(linkcontainer)

                            // create nextvid/lastvid link
                            let lastvidlink = document.createElement('a')
                            lastvidlink.classList.add('stockedseries-row-link')
                            if (object.lastVidID != undefined && object.lastVidName != undefined) {
                                lastvidlink.textContent = `最後に見た動画: ${object.lastVidName}`
                                lastvidlink.setAttribute('href',`https://www.nicovideo.jp/watch/${object.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                            } else {
                                lastvidlink.setAttribute('style','color: var(--textcolor3)')
                                lastvidlink.textContent = `最後に見た動画が保存されていません`
                            }
                            elem.appendChild(lastvidlink)
                            let nextvidlink = document.createElement('a')
                            nextvidlink.classList.add('stockedseries-row-link')
                            if (object.nextVidID != undefined && object.nextVidID != undefined) {
                                nextvidlink.textContent = `次の動画: ${object.nextVidName}`
                                nextvidlink.setAttribute('href',`https://www.nicovideo.jp/watch/${object.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                            } else {
                                nextvidlink.setAttribute('style','color: var(--textcolor3)')
                                nextvidlink.textContent = `次の動画が保存されていません`
                            }
                            elem.appendChild(nextvidlink)
                            // push to stockedseries container
                            document.querySelector('.stockedserieslist-container').appendChild(elem)
                        })
                    }, onError);
                }
            })
    
            $(document).on('click', '#removeseries', function () {
                manageSeriesStock(this.closest('.stockedseries-row').id)
                this.closest('.stockedseries-row').remove()
            })
            $(document).on('click', '#togglelock', function () {
                //console.log($(this).text())
                if ($(this).text() == 'ロック解除') {
                    $(".stockedserieslist-container").sortable({
                        "axis": "y",
                        "update": function(event,ui) {
                            //console.log()
                            let sortlist = $('.stockedserieslist-container').sortable("toArray")
                            var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
                            getNewStorageData.then(function (newresult) {
                                let currentstock = newresult.stockedseries
                                currentstock.sort((a,b) => sortlist.indexOf(a.seriesID) - sortlist.indexOf(b.seriesID))
                                //console.log(currentstock)
                                chrome.storage.sync.set({
                                    "stockedseries": currentstock
                                })
                            })
                        }
                    }
                    )
                    $(this).text('ロック')
                } else {
                    $(".stockedserieslist-container").sortable("destroy")
                    $(this).text('ロック解除')
                }
            })
        }
    });

    
    if (result.hidemetadata == "searchandhome" || result.hidemetadata == "all") {
        document.documentElement.classList.add('PM-HideMetaData')
    }
    if (result.enablevisualpatch == true) {
        addCSS(chrome.runtime.getURL("pagemod/css/visualpatch.css"))
    }
    $(document).on('click',function(e) {
        //console.log(e.target.closest('.pmbutton-container'))
        if(e.target.closest('.pmbutton-container') == null && e.target.id != 'removeseries') {
            $('.stockedserieswindow-container, .pm-viCommanderContainer, #misskeysharecontainer').remove()
        }
    });
}
getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.darkmode != "" && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
        //addCSS(chrome.runtime.getURL("pagemod/css/darkmode/video_top.css"));
    }
    if ( result.hidevidtopad ) {
        $('.VideoIntroductionAreaContainer').remove();
    }
    console.log(location.pathname)
    if ( result.enablecustomvideotop && result.customvideotop != undefined && ( location.pathname == "/video_top" || location.pathname == "/video_top/" ) ) {
        $('.BaseLayout-main').append('<div class="BaseLayout-main-custom" style="margin-top: 16px"></div>')
        $.each(result.customvideotop, function(i,object) {
            if ( object.dispstat == true ) {
                $('.BaseLayout-main-custom').append($(`.${object.classname}`).parent('.BaseLayout-block'))
            } else {
                $(`.${object.classname}`).parent('.BaseLayout-block').css('display','none');
            }
            $('.BaseLayout-main-custom').before($('.BaseLayout-main-custom > .BaseLayout-block'))
        })
        $('.BaseLayout-main-custom').remove()

    }
    if ( result.vidtoptwocolumn ) {
        $('.BaseLayout-main').append('<div class="Baselayout-main-twocolumn BaseLayout-main-left" style="margin-top: 16px"></div><div class="Baselayout-main-twocolumn BaseLayout-main-right" style="margin-top: 16px"></div>');
        $('.BaseLayout-main .BaseLayout-block').each(function(i, elem){
            if ( (i + 1) % 2 == 1 ) {
                $('.BaseLayout-main-left').append(elem)
            } else {
                $('.BaseLayout-main-right').append(elem)
            }
        });
        $('.BaseLayout-main').css({
            'flex-direction':'row',
            'padding':'0 32px'
        })
        addCSS(chrome.runtime.getURL("pagemod/css/vidtoptwocolumn.css"))
    }
    if ( result.enableseriesstock == true ) {
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
        $('#openstock').on('click', function() {
            console.log( document.querySelector('.stockedserieswindow-container') != null )
            if (document.querySelector('.stockedserieswindow-container') != null) {
                $('.stockedserieswindow-container').remove()
            } else {
                // <button id="togglelock" class="togglelock">ロック解除</button>
                $('.openstock-container').before('<div class="stockedserieswindow-container"><div>ストック中のシリーズ</div></div>')
                var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
                getNewStorageData.then(function(newresult) {
                    $.each(newresult.stockedseries, function(i,object) {
                        console.log(object)
                        let playlist = btoa(`{"type":"series","context":{"seriesId":${object.seriesID}}}`)
                        let serieslinkhtml = `<div class="stockedseries-row"><div class="serieslink-container"><a class="stockedseries-row-link" href="https://www.nicovideo.jp/series/${object.seriesID}">${object.seriesName}</a><button id="removeseries" class="removeseries">削除</button></div></div>`
                        let lastvidhtml = ``
                        let nextvidhtml = ``
                        if ( object.lastVidID != undefined && object.lastVidName != undefined ) {
                            lastvidhtml = `<a class="stockedseries-row-link" href="https://www.nicovideo.jp/watch/${object.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}">最後に見た動画: ${object.lastVidName}</a>`
                        } else {
                            lastvidhtml = `<span class="stockedseries-row-link" style="color: var(--textcolor3)">最後に見た動画が保存されていません</span>`
                        }
                        if ( object.nextVidID != undefined && object.nextVidID != undefined ) {
                            nextvidhtml = `<a class="stockedseries-row-link" href="https://www.nicovideo.jp/watch/${object.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}">次の動画: ${object.nextVidName}</a>`
                        } else {
                            nextvidhtml = `<span class="stockedseries-row-link" style="color: var(--textcolor3)">次の動画が保存されていません</span>`
                        }
                        $('.stockedserieswindow-container').append(`<div class="stockedseries-row"><div class="serieslink-container"><a class="stockedseries-row-link" href="https://www.nicovideo.jp/series/${object.seriesID}">${object.seriesName}</a><button id="removeseries" class="removeseries">削除</button></div>${lastvidhtml}${nextvidhtml}</div>`)
                        $('.stockedseries-row').draggable();
                        $('.stockedseries-row').draggable("disable");
                    })
                }, onError);
            }
        })
        /*
        $(document).on('click', '#removeseries', function() {
            manageSeriesStock( $(this).prev().prop('href').slice(32) )
            $(this).parent('.stockedseries-row').remove()
        })
        $(document).on('click', '#togglelock', function() {
            console.log($(this).text())
            if ( $(this).text() == 'ロック解除' ) {
                $('.stockedseries-row').draggable("enable");
                $(this).text('ロック')
            } else {
                $('.stockedseries-row').draggable("disable");
                $(this).text('ロック解除')
            }
        })*/
    }
}
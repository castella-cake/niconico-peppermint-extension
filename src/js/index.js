const { getSyncStorageData } = require("./modules/storageControl.js");
const { addCSS, removeCSS, pushCSSRule } = require("./modules/styleControl.js");

function onError(error) {
    console.log(`Error: ${error}`);
}

const locationWhiteList = ["www.nicovideo.jp", "live.nicovideo.jp", "anime.nicovideo.jp", "inform.nicovideo.jp", "koken.nicovideo.jp"];
const livePathnameWhiteList = ["/focus", "/recent", "/timetable", "/ranking"]
function createFastCSSRule(result) {
    // #region HTML要素用のパレット設定
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) && locationWhiteList.includes(location.hostname)) {
        document.documentElement.classList.add('PMDM-Assist')
        if (result.darkmode == 'custom' && result.customcolorpalette != undefined) {
            document.documentElement.style = `${document.documentElement.style}
            --bgcolor1:${result.customcolorpalette.bgcolor1};
            --bgcolor2:${result.customcolorpalette.bgcolor2};
            --bgcolor3:${result.customcolorpalette.bgcolor3};
            --bgcolor4:${result.customcolorpalette.bgcolor4};
            --textcolor1:${result.customcolorpalette.textcolor1};
            --textcolor2:${result.customcolorpalette.textcolor2};
            --textcolor3:${result.customcolorpalette.textcolor3};
            --textcolornew:${result.customcolorpalette.textcolornew};
            --accent1:${result.customcolorpalette.accent1};
            --accent2:${result.customcolorpalette.accent2};
            --hover1:${result.customcolorpalette.hover1};
            --hover2:${result.customcolorpalette.hover2};
            --linktext1:${result.customcolorpalette.linktext1};
            --linktext2:${result.customcolorpalette.linktext2};
            --linktext3:${result.customcolorpalette.linktext3};
            --nicoru1:${result.customcolorpalette.nicoru1};
            --nicoru2:${result.customcolorpalette.nicoru2};
            --nicoru3:${result.customcolorpalette.nicoru3};
            --nicoru4:${result.customcolorpalette.nicoru4};
            --dangerous1:${result.customcolorpalette.dangerous1 ? result.customcolorpalette.dangerous1 : "#fff"};`
        } else {
            document.documentElement.classList.add(`PMDMP-${result.darkmode}`)
        }
        //console.log(result.darkmode)
        if (location.hostname == "anime.nicovideo.jp") {
            document.documentElement.classList.add('PMDM-NAnime')
        }
        if (location.hostname == "live.nicovideo.jp" && ( location.pathname == "/" || location.pathname == "" || livePathnameWhiteList.includes(location.pathname) )) {
            document.documentElement.classList.add('PMDM-NicoLiveHome')
        }
        if (location.hostname == "live.nicovideo.jp" && location.pathname.startsWith("/watch")) {
            document.documentElement.classList.add('PMDM-NicoLiveWatch')
        }
        if (location.hostname == "inform.nicovideo.jp") {
            document.documentElement.classList.add('PMDM-Inform')
        }
        if (location.hostname == "koken.nicovideo.jp") {
            document.documentElement.classList.add('PMDM-Koken')
        }
        if ( locationWhiteList.includes(location.hostname) ) {
            document.documentElement.classList.add('PMDM-Enabled')
        }
        if (location.hostname == "www.nicovideo.jp"){
            if (location.pathname.startsWith("/watch")) {
                document.documentElement.classList.add('PMDM-VidWatch')
            } else if (location.pathname.startsWith("/ranking")) {
                document.documentElement.classList.add('PMDM-Ranking')
            } else if (location.pathname.startsWith("/video_top")) {
                document.documentElement.classList.add('PMDM-VideoTop')
            } else if (location.pathname.startsWith("/search") || location.pathname.startsWith("/tag") || location.pathname.startsWith("/mylist_search")) {
                document.documentElement.classList.add('PMDM-SearchPage')
            }
        }
    } 
    // #endregion
    // #region その他QoL機能のアクティベート
    if ( result.highlightnewnotice == true ) {
        document.documentElement.classList.add('PM-HighlightNewNotice')
    }
    if ( result.hideheaderbanner == true ) {
        document.documentElement.classList.add('PM-HideHeaderBanner')
    }
    if ( location.hostname == "www.nicovideo.jp" ) {
        if ( result.hidesupporterbutton == "all" || (result.hidesupporterbutton == "watch" && location.pathname.indexOf('/watch') != -1) ) {
            document.documentElement.classList.add('PM-HideSupporter')
        }
        if ( result.alignpagewidth == true && ( location.pathname == "/" || location.pathname == "" )) {
            document.documentElement.classList.add('PM-AlignPageWidth')
        }
        if (result.hidepopup == true) {
            document.documentElement.classList.add('PM-HideAppeal')
        }
        if (result.fixedheaderwidth == true) {
            document.documentElement.classList.add('PM-FixedHeaderWidth')
        }
        if ( result.vidtoptwocolumn === true ) {
            document.documentElement.classList.add('PM-VideoTopTwoColumn')
        }
    }
    if ( location.hostname == "sp.nicovideo.jp" && location.pathname.startsWith("/watch") ) {
        if ( result.enablespredirect == true ) {
            location.href = location.href.replace("sp.nicovideo.jp","www.nicovideo.jp");
        }
    }
    // #endregion
    if (result.usetheaterui == true && result.usenicoboxui != true && location.hostname == "www.nicovideo.jp" && location.pathname.startsWith("/watch")) {
        document.documentElement.classList.add('is-PMTheaterUI')
        document.documentElement.classList.add('PM-TheaterMode')
    }
}

function onHeadPreparedCSS(result) {
    if (result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        if (locationWhiteList.includes(location.hostname)) {
            if (location.hostname == "www.nicovideo.jp") {
                if (location.pathname.indexOf('/video_top') != -1) {
                    //console.log('vidtop')
                    //addCSS(chrome.runtime.getURL("style/css/darkmode/video_top.css"), true);
                    if (result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) {
                        pushCSSRule('.RankingVideosContainer .ColumnTitle-icon,.ViewHistoriesContainer .ColumnTitle-icon,.NicoadVideosContainer .ColumnTitle-icon,.HotTagsContainer .ColumnTitle-icon,.NewArrivalVideosContainer .ColumnTitle-icon,.NewsNotificationContainer-column[data-sub-column="maintenance"] .ColumnTitle-icon {filter: brightness(5.0)}')
                    }
                } else if (location.pathname.indexOf('/ranking') != -1) {
                    //addCSS(chrome.runtime.getURL("style/css/darkmode/ranking.css"), true);
                } else if (location.pathname.indexOf('/watch') != -1 && result.usetheaterui != true && result.usenicoboxui != true) {
                    addCSS(chrome.runtime.getURL("style/css/darkmode/watch.css"), true);
                }
            }
        }
    } else { addCSS(chrome.runtime.getURL("style/css/peppermint-ui-var.css"), true) }
    if (result.enablevisualpatch == true) {
        addCSS(chrome.runtime.getURL("style/css/visualpatch.css"))
    }
}
getSyncStorageData.then(createFastCSSRule, onError)

// <head>が増えた時に一度だけbaseCSSRuleを呼ぶ。
const observehtml = document.documentElement
const observer = new MutationObserver(records => {
    records.forEach(function (record) {
        var addedNodes = record.addedNodes;
        for (var i = 0; i < addedNodes.length; i++) {
            var node = addedNodes[i];
            if (node.tagName === 'HEAD') {
                getStorageData.then(onHeadPreparedCSS, onError);
                observer.disconnect();
                break;
            }
        }
    });
})
if (document.head == null) {
    observer.observe(observehtml, {
        childList: true
    })
} else {
    getSyncStorageData.then(onHeadPreparedCSS, onError);
}
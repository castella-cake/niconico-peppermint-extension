import { getSyncStorageData } from "../utils/storageControl";
import { addCSS, pushCSSRule } from "../utils/styleControl";
import "./style/index.styl"

const allegationPattern = new MatchPattern('*://www.nicovideo.jp/comment_allegation/*');

export default defineContentScript({
    matches: ['*://*.nicovideo.jp/*'],
    runAt: "document_start",
    allFrames: true,
    async main() {
        function onError(error: any) {
            console.log(`Error: ${error}`);
        }
        
        const locationWhiteList = ["www.nicovideo.jp", "live.nicovideo.jp", "anime.nicovideo.jp", "inform.nicovideo.jp", "koken.nicovideo.jp", "nicoad.nicovideo.jp"];
        function createFastCSSRule(result: { [key: string]: any }) {
            // #region HTML要素用のパレット設定
            if (result.darkmode
                && !(result.darkmodedynamic === true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
                && locationWhiteList.includes(location.hostname)
                && !(location.hostname === "www.nicovideo.jp" && location.pathname.startsWith("/watch") && result.usenativedarkmode)
                && !allegationPattern.includes(location.toString())
            ) {
                document.documentElement.classList.add('PMDM-Assist')
                if (result.darkmode === 'custom' && result.customcolorpalette !== undefined) {
                    Object.keys(result.customcolorpalette).forEach(elem => {
                        document.documentElement.style.setProperty(elem, result.customcolorpalette[elem])
                    })
                } else {
                    document.documentElement.classList.add(`PMDMP-${result.darkmode}`)
                }
                //console.log(result.darkmode)
                if (location.hostname === "blog.nicovideo.jp" && location.pathname.startsWith("/niconews")) {
                    document.documentElement.classList.add('PMDM-NicoInfo')
                }
                if (location.hostname === "anime.nicovideo.jp") {
                    document.documentElement.classList.add('PMDM-NAnime')
                }
                if (location.hostname === "live.nicovideo.jp") {
                    document.documentElement.classList.add('PMDM-NicoLiveHome')
                }
                if (location.hostname === "live.nicovideo.jp" && location.pathname.startsWith("/watch")) {
                    document.documentElement.classList.add('PMDM-NicoLiveWatch')
                }
                if (location.hostname === "inform.nicovideo.jp") {
                    document.documentElement.classList.add('PMDM-Inform')
                }
                // iframe内の福引には未対応なのでpathnameで弾く
                if (location.hostname === "koken.nicovideo.jp" && !location.pathname.startsWith("/campaign/widget")) {
                    document.documentElement.classList.add('PMDM-Koken')
                }
                if ( locationWhiteList.includes(location.hostname) && ( location.hostname !== "nicoad.nicovideo.jp" || (location.hostname === "nicoad.nicovideo.jp" && location.pathname.startsWith("/video/choice-player-widget")) ) ) {
                    document.documentElement.classList.add('PMDM-Enabled')
                }
                if (location.hostname === "www.nicovideo.jp" && (
                    location.pathname.startsWith("/watch") ||
                    location.pathname.startsWith("/ranking") ||
                    location.pathname.startsWith("/tag") ||
                    location.pathname.startsWith("/search") ||
                    location.pathname.startsWith("/series_search") ||
                    location.pathname.startsWith("/mylist_search") ||
                    location.pathname.startsWith("/user_search")
                )) {
                    document.documentElement.classList.add('PMDM-ModernPage')
                } else if (location.hostname === "www.nicovideo.jp" && location.pathname.startsWith("/video_top")) {
                    document.documentElement.classList.add('PMDM-VideoTop')
                } else if (location.pathname.startsWith("/search") || location.pathname.startsWith("/tag") || location.pathname.startsWith("/mylist_search")) {
                    document.documentElement.classList.add('PMDM-SearchPage')
                }
            } 
            // #endregion
            // #region その他QoL機能のアクティベート
            if ( result.highlightnewnotice === true ) {
                document.documentElement.classList.add('PM-HighlightNewNotice')
            }
            if ( result.hideheaderbanner === true ) {
                document.documentElement.classList.add('PM-HideHeaderBanner')
            }
            if ( location.hostname == "www.nicovideo.jp" ) {
                if ( result.hidesupporterbutton === "all" || (result.hidesupporterbutton === "watch" && location.pathname.indexOf('/watch') !== -1) ) {
                    document.documentElement.classList.add('PM-HideSupporter')
                }
                if ( result.alignpagewidth === true && ( location.pathname === "/" || location.pathname === "" )) {
                    document.documentElement.classList.add('PM-AlignPageWidth')
                }
                if (result.hidepopup === true) {
                    document.documentElement.classList.add('PM-HideAppeal')
                }
                if (result.fixedheaderwidth === true) {
                    document.documentElement.classList.add('PM-FixedHeaderWidth')
                }
                if ( location.pathname.startsWith("/ranking") && result.hiderankpagead === true ) {
                    document.documentElement.classList.add('PM-HideRankingPageNiconiAdRow')
                }
                if ( location.pathname.startsWith("/watch") && result.watchhideknowntitle === true ) {
                    document.documentElement.classList.add('PM-HideKnownTitle')
                }
            }
            if ( result.enablespredirect === true ) {
                if ( location.hostname === "sp.nicovideo.jp" && location.pathname.startsWith("/watch") ) {
                    location.href = location.href.replace("sp.nicovideo.jp","www.nicovideo.jp");
                }
                if ( location.hostname === "sp.seiga.nicovideo.jp" ) {
                    location.href = location.href.replace("sp.seiga.nicovideo.jp","seiga.nicovideo.jp");
                }
            }

            // #endregion
        }
        
        function onHeadPreparedCSS(result: any) {
            if (result.darkmode && !(result.darkmodedynamic === true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                if (locationWhiteList.includes(location.hostname)) {
                    if (location.hostname == "www.nicovideo.jp") {
                        if (location.pathname.indexOf('/video_top') != -1) {
                            //console.log('vidtop')
                            //addCSS(browser.runtime.getURL("style/css/darkmode/video_top.css"), true);
                            if ((result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) && result.darkmode !== "nordlight") {
                                pushCSSRule('.RankingVideosContainer .ColumnTitle-icon,.ViewHistoriesContainer .ColumnTitle-icon,.NicoadVideosContainer .ColumnTitle-icon,.HotTagsContainer .ColumnTitle-icon,.NewArrivalVideosContainer .ColumnTitle-icon,.NewCommentVideosContainer .ColumnTitle-icon,.TrendyTagsWithVideosContainer .ColumnTitle-icon,.NewsNotificationContainer-column[data-sub-column="maintenance"] .ColumnTitle-icon {filter: brightness(5.0)}')
                            }
                        } else if (location.pathname.indexOf('/ranking') != -1) {
                            //addCSS(browser.runtime.getURL("style/css/darkmode/ranking.css"), true);
                        } else if (location.pathname.indexOf('/watch') != -1 && result.usetheaterui != true && result.usenicoboxui != true) {
                            addCSS(browser.runtime.getURL("/style/css/darkmode/watch.css"), true);
                        }
                    }
                }
            } else { addCSS(browser.runtime.getURL("/style/css/peppermint-ui-var.css"), true) }
            if (result.enablevisualpatch == true) {
                addCSS(browser.runtime.getURL("/style/css/visualpatch.css"))
            }
        }
        getSyncStorageData.then(createFastCSSRule, onError)
        
        // <head>が増えた時に一度だけbaseCSSRuleを呼ぶ。
        const observehtml = document.documentElement
        const observer = new MutationObserver(records => {
            records.forEach(function (record) {
                var addedNodes = record.addedNodes;
                for (var i = 0; i < addedNodes.length; i++) {
                    var node = addedNodes[i] as Element
                    if (node.tagName === 'HEAD') {
                        getSyncStorageData.then(onHeadPreparedCSS, onError);
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
    },
});

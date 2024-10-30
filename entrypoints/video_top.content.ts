import $ from "jquery"
import { addCSS, pushCSSRule } from "./modules/styleControl";


export default defineContentScript({
    matches: ["*://www.nicovideo.jp/video_top/*"],
    async main() {
        const result = await browser.storage.sync.get(null)
        if (result.darkmode && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            if (result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) {
                pushCSSRule('.RankingVideosContainer .ColumnTitle-icon,.ViewHistoriesContainer .ColumnTitle-icon,.NicoadVideosContainer .ColumnTitle-icon,.HotTagsContainer .ColumnTitle-icon,.NewArrivalVideosContainer .ColumnTitle-icon,.NewsNotificationContainer-column[data-sub-column="maintenance"] .ColumnTitle-icon {filter: brightness(5.0)}')
            }
        }
        if (result.hidevidtopad) {
            pushCSSRule('.VideoIntroductionAreaContainer {display:none}')
        }
        //console.log(location.pathname)
        if (result.enablecustomvideotop && result.customvideotop != undefined && (location.pathname == "/video_top" || location.pathname == "/video_top/")) {
            $('.BaseLayout-main').append('<div class="BaseLayout-main-custom" style="margin-top: 16px"></div>')
            $.each(result.customvideotop, function (i, object) {
                if (object.dispstat == true) {
                    $('.BaseLayout-main-custom').append($(`.${object.classname}`).parent('.BaseLayout-block'))
                } else {
                    $(`.${object.classname}`).parent('.BaseLayout-block').remove()
                }
                $('.BaseLayout-main-custom').before($('.BaseLayout-main-custom > .BaseLayout-block'))
            })
            $('.BaseLayout-main-custom').remove()

        }
        if (result.vidtoptwocolumn) {
            $('.BaseLayout-main').append('<div class="Baselayout-main-twocolumn BaseLayout-main-left" style="margin-top: 16px"></div><div class="Baselayout-main-twocolumn BaseLayout-main-right" style="margin-top: 16px"></div>');
            $('.BaseLayout-main .BaseLayout-block').each(function (i, elem) {
                //console.log(`${i + 1} ${(i + 1) % 2 === 0}`)
                //console.log(elem)
                if ((i + 1) % 2 === 0) {
                    $('.BaseLayout-main-right').append(elem)
                } else {
                    $('.BaseLayout-main-left').append(elem)
                }
            });
            addCSS(browser.runtime.getURL("/style/css/vidtoptwocolumn.css"))
        }
    },
});

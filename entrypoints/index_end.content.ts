import { getSyncStorageData } from "./modules/storageControl";
import { addCSS, addPMStyleElem, pushCSSRule } from "./modules/styleControl";
import $ from "jquery"

function onError(error: any) {
    console.log(`Error: ${error}`);
}

export default defineContentScript({
    matches: ['*://*.nicovideo.jp/*'],
    runAt: 'document_end',
    main() {
        if ( document.querySelector('.pmbutton-container') == undefined || document.querySelector('.pmbutton-container') == null ) {
            let pmbuttoncontainer = document.createElement('div')
            pmbuttoncontainer.classList.add('pmbutton-container')
            document.body.appendChild(pmbuttoncontainer)
        }
        //$('body').append('<div class="version-watermark" style="position: sticky; left:0; bottom:0px;color:#aaa;font-size:8px">Niconico-PepperMint Preview</div>');
        addCSS("https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined")
        addCSS(browser.runtime.getURL("/style/css/peppermint-ui.css"));
        
        // firstの実行後でもいなかったら追加し、もういたらとりあえず最後尾へ動いてもらう
        if ( addPMStyleElem() == false ) {
            let html = document.documentElement
            let peppermintStyle = document.getElementById('peppermint-css')
            if (peppermintStyle && html) html.appendChild(peppermintStyle)
        }
        
        let locationWhiteList = ["www.nicovideo.jp", "live.nicovideo.jp", "blog.nicovideo.jp", "anime.nicovideo.jp", "inform.nicovideo.jp"];
        
        getSyncStorageData.then(createBaseCSSRule, onError);
        function createBaseCSSRule(result: any) {
            // #region パレットとダークモード関連
            if ( result.darkmode != "" && result.darkmode != undefined && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ) {
                if (result.darkmode == 'custom' && result.customcolorpalette != undefined) {
                    pushCSSRule(`:root{--bgcolor1:${result.customcolorpalette.bgcolor1};--bgcolor2:${result.customcolorpalette.bgcolor2};--bgcolor3:${result.customcolorpalette.bgcolor3};--bgcolor4:${result.customcolorpalette.bgcolor4};--textcolor1:${result.customcolorpalette.textcolor1};--textcolor2:${result.customcolorpalette.textcolor2};--textcolor3:${result.customcolorpalette.textcolor3};--textcolornew:${result.customcolorpalette.textcolornew};--accent1:${result.customcolorpalette.accent1};--accent2:${result.customcolorpalette.accent2};--hover1:${result.customcolorpalette.hover1};--hover2:${result.customcolorpalette.hover2};--linktext1:${result.customcolorpalette.linktext1};--linktext2:${result.customcolorpalette.linktext2};--linktext3:${result.customcolorpalette.linktext3};--nicoru1:${result.customcolorpalette.nicoru1};--nicoru2:${result.customcolorpalette.nicoru2};--nicoru3:${result.customcolorpalette.nicoru3};--nicoru4:${result.customcolorpalette.nicoru4};}`)
                } else {
                    //addCSS(browser.runtime.getURL("style/css/darkmode/" + result.darkmode + ".css"));
                }
                if ( locationWhiteList.includes(location.hostname) ) {
                    if (result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) {
                        $('.NiconicoLogo_black').addClass('NiconicoLogo_white')
                        $('.NiconicoLogo_black').removeClass('NiconicoLogo_black')
                        $('.NicovideoLogo[data-color="black"]').attr('data-color',"white")
                        document.body.classList.add('is-PMDarkPalette')
                    } else {
                        document.body.classList.add('is-PMLightPalette')
                    }
                }
                document.documentElement.classList.remove('PMDM-Assist')
                //addCSS(browser.runtime.getURL("style/css/peppermint-ui-var.css"), true, `link[href="${browser.runtime.getURL("style/css/darkmode/" + result.darkmode + ".css")}"]`, 'before')
            } else { addCSS(browser.runtime.getURL("/style/css/peppermint-ui-var.css"), true) }
            // #endregion
        
            // #region ヘッダー背景色
            if (result.headerbg == "gradient") {
                document.documentElement.classList.add('PM-HeaderBG-Custom')
                $('html').css('--headercolor', "linear-gradient(#2d2d2d, #000000)");
            } else if (result.headerbg == "custom") {
                document.documentElement.classList.add('PM-HeaderBG-Custom')
                $('html').css('--headercolor', result.headercolor);
                //console.log(`HeaderBG changed to ${result.headercolor}`);
            }
            // #endregion
        
            if (result.hidemetadata == "searchandhome" || result.hidemetadata == "all") {
                document.documentElement.classList.add('PM-HideMetaData')
            }
            if (result.enablevisualpatch == true) {
                addCSS(browser.runtime.getURL("/style/css/visualpatch.css"))
            }
            document.addEventListener('click', function(e) {
                //console.log(e.target.closest('.pmbutton-container'))
                if (e.target && e.target instanceof Element && e.target.closest('.pmbutton-container') == null && e.target.id != 'removeseries') {
                    const windowElemList = document.querySelectorAll('.stockedserieswindow-container, .pm-viCommanderContainer, #misskeysharecontainer');
                    windowElemList.forEach((elem) => { elem.remove() });
                }
            });
        }
    },
});

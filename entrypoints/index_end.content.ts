import { getSyncStorageData } from "../utils/storageControl";
import { addCSS, addPMStyleElem, pushCSSRule } from "../utils/styleControl";
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
            if ( result.darkmode && result.darkmode !== ""
                && !(result.darkmodedynamic == true && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) 
                && !(location.hostname == "www.nicovideo.jp" && location.pathname.startsWith("/watch") && result.usenativedarkmode)
            ) {
                if (result.darkmode == 'custom' && result.customcolorpalette) {
                    const varArray = Object.keys(result.customcolorpalette).map(item => {
                        return `--${item}: ${result.customcolorpalette[item]};`
                    })
                    pushCSSRule(`:root{${varArray.join("")}}`)
                } else {
                    //addCSS(browser.runtime.getURL("style/css/darkmode/" + result.darkmode + ".css"));
                }
                if ( locationWhiteList.includes(location.hostname) ) {
                    if ((result.darkmode != "custom" || (result.darkmode == "custom" && result.customcolorpalette.mainscheme == "dark")) && result.darkmode !== "nordlight") {
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

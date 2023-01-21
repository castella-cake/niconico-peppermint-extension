// www.nicovideo.jpの全てで実行

$('body').append('<div class="pmbutton-container" style="position: sticky; left:0; bottom:12px; margin: 12px; width: fit-content;"></div>');
//$('body').append('<div class="version-watermark" style="position: sticky; left:0; bottom:0px;color:#aaa;font-size:8px">Niconico-PepperMint Preview</div>');
addCSS("https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined")
addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui.css"));
getStorageData.then(createBaseCSSRule, onError);
function createBaseCSSRule(result) {
    $(function() {
        if ( result.highlightnewnotice == true ) {
            addCSS(chrome.runtime.getURL("pagemod/css/other/highlightnewnotice.css"), true);
        }
        if ( result.darkmode != "" && result.darkmode != undefined ) {
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css"), true);
            addCSS(chrome.runtime.getURL("pagemod/css/darkmode/forall.css"), true);
            addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true, `link[href="${chrome.runtime.getURL("pagemod/css/darkmode/" + result.darkmode + ".css")}"]`, 'before')
        } else { addCSS(chrome.runtime.getURL("pagemod/css/peppermint-ui-var.css"), true) }
        if ( result.alignpagewidth == true ) {
            addCSS(chrome.runtime.getURL("pagemod/css/other/alignpagewidth.css"), true);
        } else {
            console.log(result.alignpagewidth)
        }
        if (result.headerbg == "gradient") {
            addCSS(chrome.runtime.getURL("pagemod/css/header/gradient.css"), true);
        } else if (result.headerbg == "custom") {
            addCSS(chrome.runtime.getURL("pagemod/css/header/custom.css"), true);
            $('body').css('--headercolor', result.headercolor);
            console.log(`HeaderBG changed to ${result.headercolor}`);
        }
    });
}
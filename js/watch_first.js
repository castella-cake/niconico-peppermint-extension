getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.usenicoboxui != true && result.usetheaterui == true ) {
        // theater UI
        // cssは後から読み込まれるせいで.css()が使えないものに対してのみ使う
        // video関連は早めにスタイルシートで書かないとコメントコンテナーやシンボルが動画サイズの変更を反映してくれない
        addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        addCSS(chrome.runtime.getURL("pagemod/css/header/black.css"))
    }
    console.log(`createCSSRule Finished!`)
}

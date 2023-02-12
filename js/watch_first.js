getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.usenicoboxui != true && result.usetheaterui == true ) {
        // theater UI
        // video関連は早めにスタイルシートで書かないとコメントコンテナーやシンボルが動画サイズの変更を反映してくれない
        addCSS(chrome.runtime.getURL("pagemod/css/theater_video.css"));
        addCSS(chrome.runtime.getURL("pagemod/css/header/black.css"))
    }
    if (result.nicoboxuichanged == true) {
        console.log('changed!')
        $('#CommonHeader')
        .css({
            'transform': 'translate(0, -100%)',
        })
        .css({
            'transform': 'translate(0, 0)',
            'transition': 'transform 0.2s ease',
        })
        $('body').append('<div id="fadeouter"></div>')
        setTimeout(function() {
            $('#fadeouter').css({
                'opacity':'0%',
                'transition': 'opacity 0.2s ease',
            })
        },1)
        setTimeout(function() {
            $('#fadeouter').remove()
        },300)
        chrome.storage.sync.set({"nicoboxuichanged": false});
    }
}

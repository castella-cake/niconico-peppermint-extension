getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if ( result.quickvidarticle == true ) {
        $(function() {
            let diclink = "https://dic.nicovideo.jp/v/" + location.pathname.slice(7)
            $('.VideoTitle').append('<a href="' + diclink + '" style="width:16px;height:16px;display:inline-block;margin-left:5px;position:relative;top:5px;" class="Link NicoDicLink" target="_blank" rel="noopener noreferrer"><span class="NicoDicIcon is-available"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill="#fff" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.4"><path d="M4 12a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h92a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H62L50 24h38a4 4 0 0 1 4 4v68a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4h18l12-12H4Zm26 52a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h40a2 2 0 0 0 2-2V66a2 2 0 0 0-2-2H30Zm0-28a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h40a2 2 0 0 0 2-2V38a2 2 0 0 0-2-2H30Z"></path></svg></span></a>')
        })
    }
    if (result.usenicoboxui != true && result.usetheaterui == true ) {
        // theater UI
        document.querySelector('.MainVideoPlayer video').addEventListener('canplay', function(e) {
            console.log(`Played!!!!!!!!!!!!!!!!!!`)
            $('.CommentRenderer').css({
                'width': $(e).width() + "px",
                'height': $(e).height() + "px",
            })
            $('.VideoSymbolContainer').css({
                'width': $(e).width() + "px",
                'height': $(e).height() + "px",
            })
        })
    }
}
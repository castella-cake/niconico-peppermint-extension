$('a').on('click', function(e) {
    e.preventDefault();
    $('body').css({
        'animation': 'fadeout 0.1s ease forwards 0s',
    })
    let href = $(this).attr('href')
    setTimeout(function() {
        location.href = href
    }, 100)
})

function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () {
        $('#confirmreset').on('click', function() {
            // HACK: chrome.storage.sync.clear() はFirefoxで動作しないため、UAで判定する。bug?
            let storageclear = chrome.storage.sync.clear() ?? browser.storage.sync.clear()
            let localstorageclear = chrome.storage.local.clear() ?? browser.storage.local.clear()
            Promise.all([storageclear, localstorageclear]).then(() => {
                $('#result').text('リセットしました。5秒後にメイン設定に戻ります...')
                $('button,a').remove()
                setTimeout(function() {
                    window.location.href = "settings.html"
                }, 5000)
                
            })
        })
});
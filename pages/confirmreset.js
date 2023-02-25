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
            let storageclear = chrome.storage.sync.clear()
            if (window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
                storageclear = browser.storage.sync.clear()
            }
            storageclear.then(() => {
                $('#result').text('リセットしました。5秒後にメイン設定に戻ります...')
                $('button,a').remove()
                setTimeout(function() {
                    window.location.href = "option.html"
                }, 5000)
                
            })
        })
});
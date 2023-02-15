if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    $('body').css({
        'color':'#fff',
        'background-color':'#252525'
    })
}

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
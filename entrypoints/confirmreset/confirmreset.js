function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", function () {
        $('#confirmreset').on('click', function() {
            let storageclear = browser.storage.sync.clear()
            let localstorageclear = browser.storage.local.clear()
            Promise.all([storageclear, localstorageclear]).then(() => {
                $('#result').text('リセットしました。5秒後にメイン設定に戻ります...')
                $('button,a').remove()
                setTimeout(function() {
                    window.location.href = "settings.html"
                }, 5000)
                
            })
        })
});
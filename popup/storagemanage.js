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
    function showStorageData(result) {
        let storageText = JSON.stringify(result)
        console.log(storageText)
        $('#storage-data').text(storageText)
        $('#storagetoclipboard').on('click', function() {
            navigator.clipboard.writeText(storageText);
            $(this).text('コピーしました')
        })
        $('#showstorage').on('click', function() {
            if ( $(this).text() == "表示" ) {
                $('#storage-data').css({
                    'background-color':'transparent',
                    'color':'inherit'
                })
                $(this).text('非表示')
            } else {
                $('#storage-data').css({
                    'background-color':'#000',
                    'color':'#000'
                })
                $(this).text('表示')
            }
            
        })
        $('#import').on('click', function() {
            let input = $('#inputstorage').val()
                try {
                    let importedstorage = JSON.parse(input)
                    if ( !$("#noclearstorage").prop('checked') ) {
                        let storageclear = chrome.storage.sync.clear()
                        if (window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
                            storageclear = browser.storage.sync.clear()
                        }
                        storageclear.then(() => {
                            chrome.storage.sync.set(importedstorage)
                            $('#importresult').css('color','green')
                            $('#importresult').text(`インポートに成功しました`)
                        })
                    } else {
                        chrome.storage.sync.set(importedstorage)
                        $('#importresult').css('color','green')
                        $('#importresult').text(`インポートに成功しました`)
                    }
                } catch (err) {
                    $('#importresult').css('color','red')
                    $('#importresult').text(`インポートに失敗しました: ${err}`)
                }
        })
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(showStorageData, onError)
});
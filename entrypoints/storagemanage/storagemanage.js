import $ from 'jquery'

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
    function showStorageData(result) {
        let storageText = JSON.stringify(result)
        //console.log(storageText)
        document.querySelector('#storage-data').textContent = storageText
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
                        let storageclear = browser.storage.sync.clear()
                        storageclear.then(() => {
                            browser.storage.sync.set(importedstorage)
                            $('#importresult').css('color','green')
                            $('#importresult').text(`インポートに成功しました`)
                        })
                    } else {
                        browser.storage.sync.set(importedstorage)
                        $('#importresult').css('color','green')
                        $('#importresult').text(`インポートに成功しました`)
                    }
                } catch (err) {
                    $('#importresult').css('color','red')
                    $('#importresult').text(`インポートに失敗しました: ${err}`)
                }
        })
    }
    let getStorageData = browser.storage.sync.get(null);
    getStorageData.then(showStorageData, onError)
    let getLocalStorageData = browser.storage.local.get(null)
    getLocalStorageData.then(function(result){
        let localStorageText = JSON.stringify(result)
        let localStorageBlob = new Blob([localStorageText])
        document.querySelector('#localstoragesize').textContent = localStorageBlob.size
        $('#localstoragetoclipboard').on('click', function() {
            navigator.clipboard.writeText(localStorageText);
            $(this).text('コピーしました')
        })
    },onError)
    document.getElementById('clearlocalstorage').addEventListener('click',function() {
        let localstorageclear = browser.storage.local.clear()
        if (localstorageclear == undefined) {
            localstorageclear = browser.storage.local.clear()
        }
        localstorageclear.then(() => {
            location.reload()
        })
    })
});
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
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(showStorageData, onError)
});
function addToStock(newresult) {
    if (newresult.stockedseries != undefined) {
        if (newresult.stockedseries.findIndex(series => series.seriesID === location.pathname.slice(8)) != -1) {
            var currentstock = newresult.stockedseries
            var newstock = currentstock.filter(obj => obj.seriesID !== location.pathname.slice(8));
            chrome.storage.sync.set({
                "stockedseries": newstock
            })
            $('#addtostock').text("add")
            $('#addtostock').css({
                'background': '#00796b'
            })
            $("#addtostock-text").text("ストックに追加")
        } else {
            var currentstock = newresult.stockedseries
            currentstock.push({ seriesID: location.pathname.slice(8), seriesName: $('.SeriesDetailContainer-bodyTitle').text() });
            chrome.storage.sync.set({
                "stockedseries": currentstock
            })
            $('#addtostock').text("remove")
            $('#addtostock').css({
                'background': '#d32f2f'
            })
            $("#addtostock-text").text("ストックから削除")
        }
    } else {
            var currentstock = []
            currentstock.push({ seriesID: location.pathname.slice(8), seriesName: $('.SeriesDetailContainer-bodyTitle').text() });
            chrome.storage.sync.set({
                "stockedseries": currentstock
            })
            $('#addtostock').text("remove")
            $('#addtostock').css({
                'background': '#d32f2f'
            })
            $("#addtostock-text").text("ストックから削除")
    }
}

getStorageData.then(createCSSRule, onError);
function createCSSRule(result) {
    if (result.enableseriesstock == true) {
        $('.pmbutton-container').append('<div class="addtostock-container"><button id="addtostock" class="material-icons" style="cursor: pointer; width: 52px; height:52px; border:none; border-radius: 128px; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); padding:0px; color: #fff; font-size: 24px; background: #00796b">add</button></div>')
        $('#addtostock').on('mouseenter', function () {
            $('#addtostock').css({
                'font-size': '28px',
                'transition': 'all .1s'
            })
            $('.addtostock-container').append('<span id="addtostock-text" style="background: #ddd;padding: 5px;border-radius: 5px;margin-left: 5px;box-shadow: 0px 0px 5px rgba(0,0,0,40%); color: #000;">ストックに追加</span>')
            var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
            getNewStorageData.then(function (newresult) {
                if (newresult.stockedseries != undefined) {
                    if (newresult.stockedseries.findIndex(series => series.seriesID === location.pathname.slice(8)) != -1) {
                        $('#addtostock-text').text("ストックから削除")
                    }
                }
            }, onError);
        })
        $('#addtostock').on('mouseleave', function () {
            $('#addtostock').css({
                'font-size': '24px',
                'transition': 'all .1s'
            })
            $('#addtostock-text').remove()
        })
        if (result.stockedseries != undefined) {
            if (result.stockedseries.findIndex(series => series.seriesID === location.pathname.slice(8)) != -1) {
                $('#addtostock').text("remove")
                $('#addtostock').css({
                    'background': '#d32f2f'
                })
            }
        }
        $('#addtostock').on('click', function () {
            var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
            getNewStorageData.then(addToStock, onError);
        })
    }
}
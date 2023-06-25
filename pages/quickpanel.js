let manifestData = chrome.runtime.getManifest();
$("#current-version").text("v" + manifestData.version_name + " MV" + manifestData.manifest_version)

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

function manageSeriesStock(seriesid, seriesname = '名称未設定') {
    return new Promise((resolve, reject) => {
        try {
            // シリーズストックの管理を行う非同期Function。存在しない場合はストックに追加し、すでに存在する場合はストックから削除します。
            // 追加した場合はtrueを、削除した場合はfalseをresolveします。
            // このため、.thenを使って追加された後に行う処理/削除された後に行う処理をIsSeriesStockedを使用せず簡潔に書くことができます。
            let getStorageData = new Promise((resolve) => chrome.storage.sync.get(["stockedseries"], resolve));
            getStorageData.then((stockdata) => {
                if (stockdata.stockedseries != undefined && stockdata.stockedseries.findIndex(series => series.seriesID === seriesid) != -1) {
                    let currentstock = stockdata.stockedseries
                    let newstock = currentstock.filter(obj => obj.seriesID !== seriesid);
                    chrome.storage.sync.set({
                        "stockedseries": newstock
                    })
                        //console.log(`Removed series from stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(false)
                } else {
                    let currentstock = stockdata.stockedseries || []
                    currentstock.push({ seriesID: seriesid, seriesName: seriesname });
                    chrome.storage.sync.set({
                        "stockedseries": currentstock
                    })
                        //console.log(`Added series to stock: id = ${seriesid}, name = ${seriesname}`)
                        resolve(true)
                }
            }, onError)
        } catch (error) {
            reject(error);
        }
    });
}

// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

function saveOptions() {
    //console.log(`submit!`)
    // storageに変更を書き込む。
    chrome.storage.sync.set(
        {
            // Global
            "darkmode": $("#select-darkmode").val(),
            "darkmodedynamic": $("#input-darkmodedynamic").prop('checked'),
            "playertheme": $("#select-playertheme").val(),
            "usetheaterui": $("#input-usetheaterui").prop('checked'),
        }
    );
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(restoreOptions, onError)
}
function restoreOptions(storage) {
    $("#select-darkmode").val(storage.darkmode || "");
    $("#input-darkmodedynamic").prop('checked', storage.darkmodedynamic);
    $("#select-playertheme").val(storage.playertheme || "");
    $("#input-usetheaterui").prop('checked', storage.usetheaterui);
}

// ストレージからHTMLに戻す！！！
function makeElem() {
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(function (result) {
        restoreOptions(result)
        if (result.enableseriesstock) {
            let titlecontainer = document.createElement('div')
            titlecontainer.classList.add('seriesstock-titlecontainer')
            let titleelem = document.createElement('h2')
            titleelem.id = 'seriesstocktitle'
            if (result.stockedseries == undefined || result.stockedseries == null) {
                titleelem.textContent = "シリーズストック (0)"
            } else {
                titleelem.textContent = "シリーズストック (" + result.stockedseries.length + ")"
            }
            // Push Elem to container
            titlecontainer.appendChild(titleelem)
            /*let locktogglebutton = document.createElement('button')
            locktogglebutton.id = 'locktoggle'
            locktogglebutton.textContent = 'ロック解除'
            locktogglebutton.type = 'button'
            titlecontainer.appendChild(locktogglebutton)*/
            // Push Container to contentarea
            document.getElementById('content-area').appendChild(titlecontainer)
            $.each(result.stockedseries, function (i, object) {
                let seriesHref = `https://www.nicovideo.jp/series/${object.seriesID}`
                // ニコニコ動画は、watchページのリンクにクエリパラメータ playlist を渡すことで連続再生できるようになります
                // 内容はJSONで、Base64でエンコードします
                let playlist = btoa(`{"type":"series","context":{"seriesId":${object.seriesID}}}`)
                // create row container dom
                let elem = document.createElement('div')
                elem.id = object.seriesID
                elem.classList.add('stockedseries-row')
    
                // create serieslink container
                let linkcontainer = document.createElement('div')
                linkcontainer.classList.add('serieslink-container')
    
                // create link
                let link = document.createElement('a')
                link.classList.add('stockedseries-row-link')
                link.setAttribute('href',seriesHref)
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                link.textContent = object.seriesName
                linkcontainer.appendChild(link)
                // create remove button
                let removebutton = document.createElement('button')
                removebutton.id = 'removeseries'
                removebutton.textContent = '削除'
                removebutton.type = 'button'
                linkcontainer.appendChild(removebutton)
                // push to row container
                elem.appendChild(linkcontainer)
    
                // create nextvid/lastvid link
                let lastvidlink = document.createElement('a')
                lastvidlink.classList.add('stockedseries-row-link')
                lastvidlink.target = "_blank"
                lastvidlink.rel = "noopener noreferrer"
                if (object.lastVidID != undefined && object.lastVidName != undefined) {
                    lastvidlink.textContent = `最後に見た動画: ${object.lastVidName}`
                    lastvidlink.setAttribute('href',`https://www.nicovideo.jp/watch/${object.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                } else {
                    lastvidlink.setAttribute('style','color: var(--textcolor3)')
                    lastvidlink.textContent = `最後に見た動画が保存されていません`
                }
                elem.appendChild(lastvidlink)
                let nextvidlink = document.createElement('a')
                nextvidlink.target = "_blank"
                nextvidlink.rel = "noopener noreferrer"
                nextvidlink.classList.add('stockedseries-row-link')
                if (object.nextVidID != undefined && object.nextVidID != undefined) {
                    nextvidlink.textContent = `次の動画: ${object.nextVidName}`
                    nextvidlink.setAttribute('href',`https://www.nicovideo.jp/watch/${object.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                } else {
                    nextvidlink.setAttribute('style','color: var(--textcolor3)')
                    nextvidlink.textContent = `次の動画が保存されていません`
                }
                elem.appendChild(nextvidlink)
                // list expand button
                /*let expandeplistbutton = document.createElement('button')
                expandeplistbutton.id = 'expandeplist'
                expandeplistbutton.textContent = 'リストを展開'
                expandeplistbutton.type = 'button'
                elem.appendChild(expandeplistbutton)*/
                // push to stockedseries container
                document.getElementById('content-area').appendChild(elem)
            })
            $(document).on('click', '#removeseries', function () {
                manageSeriesStock(this.closest('.stockedseries-row').id)
                this.closest('.stockedseries-row').remove()
                location.reload()
            })
        } else {
            if (result.quickpanelisclosed != true) {
                let elem_nothing_head = document.createElement('div')
                elem_nothing_head.textContent = ":o"
                elem_nothing_head.classList.add('nothing-here-head')
                // Push Elem
                document.getElementById('content-area').appendChild(elem_nothing_head)
                let elem_nothing = document.createElement('div')
                elem_nothing.innerHTML = "ここはPepperMint+のクイックパネルです。<br>「クイック設定を開く」もしくはタイトルをクリックして、設定に移動しましょう。<br>シリーズストックを有効化していると、ここにストック中のシリーズが表示されます。"
                elem_nothing.classList.add('nothing-here')
                // Push Elem
                document.getElementById('content-area').appendChild(elem_nothing)
                let elem_nothing_discard_container = document.createElement('div')
                elem_nothing_discard_container.classList.add('nothing-here-discard-container')
                let elem_nothing_discard = document.createElement('a')
                elem_nothing_discard.innerHTML = "今後表示しない"
                elem_nothing_discard.classList.add('nothing-here')
                elem_nothing_discard.classList.add('nothing-here-discard')
                elem_nothing_discard.id = 'nothing-here-discard'
                // Push Elem
                elem_nothing_discard_container.appendChild(elem_nothing_discard)
                elem_nothing_discard.addEventListener('click', function(){
                    elem_nothing.remove()
                    elem_nothing_head.remove()
                    elem_nothing_discard.remove()
                    chrome.storage.sync.set(
                        {
                            "quickpanelisclosed": true
                        }
                    );
                })
                document.getElementById('content-area').appendChild(elem_nothing_discard_container)
            }
        }
    }, onError);
}

$("#settings-form").on('change', saveOptions);
document.addEventListener("DOMContentLoaded", makeElem);
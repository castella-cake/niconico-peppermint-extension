let manifestData = chrome.runtime.getManifest();
$("#current-version").text("v" + manifestData.version_name + " MV" + manifestData.manifest_version)
if (chrome.browserAction != undefined) {
    chrome.browserAction.setBadgeText({ text: "" })
} else if (chrome.action != undefined) {
    chrome.action.setBadgeText({ text: "" })
}


$('a').on('click', function (e) {
    e.preventDefault();
    $('body').css({
        'animation': 'fadeout 0.1s ease forwards 0s',
    })
    let href = $(this).attr('href')
    setTimeout(function () {
        location.href = href
    }, 100)
})
function linkAction(e) {
    // 現在のタブがニコニコ動画ならそのタブで開き、そうじゃないなら新しいタブで開く...をやりたい
    // そのためにはbackground.jsにメッセージを送る必要があるんだってヴぁ

    // 一旦イベントを中止
    e.preventDefault()
    // メッセージ送信
    let openLinkMsg = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "openThisNCLink", "href": this.href }, resolve))
    openLinkMsg.then(res => {
        if (res.status != true) {
            // NGだったらwindow.openにフォールバック
            window.open(this.href)
            window.close()
        } else {
            // OKだったらclose
            window.close()
        }
    })
}

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
            // create locktoggle
            let togglelockbutton = document.createElement('button')
            togglelockbutton.id = 'togglelock'
            togglelockbutton.classList.add('material-icons-outlined')
            togglelockbutton.textContent = 'lock'
            togglelockbutton.title = "ロックを解除"
            togglelockbutton.type = 'button'
            titlecontainer.appendChild(togglelockbutton)
            // Push Container to contentarea
            document.getElementById('seriesstock').appendChild(titlecontainer)
            // create list container
            let listcontainer = document.createElement('div')
            listcontainer.classList.add('stockedserieslist-container')
            document.getElementById('seriesstock').appendChild(listcontainer)
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
                link.setAttribute('href', seriesHref)
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                link.textContent = object.seriesName
                linkcontainer.appendChild(link)

                // create remove button
                let removebutton = document.createElement('button')
                removebutton.id = 'removeseries'
                removebutton.textContent = 'delete'
                removebutton.title = "シリーズを削除"
                removebutton.type = 'button'
                removebutton.classList.add(['material-icons-outlined'])
                linkcontainer.appendChild(removebutton)
                // push to row container
                elem.appendChild(linkcontainer)

                // create nextvid/lastvid link
                let lastvidlink = document.createElement('a')
                lastvidlink.classList.add('stockedseries-row-link', 'stockedseries-row-vidlink')
                lastvidlink.target = "_blank"
                lastvidlink.rel = "noopener noreferrer"
                if (object.lastVidID != undefined && object.lastVidName != undefined) {
                    lastvidlink.textContent = `最後に見た動画: ${object.lastVidName}`
                    lastvidlink.setAttribute('href', `https://www.nicovideo.jp/watch/${object.lastVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                    lastvidlink.addEventListener('click',linkAction)
                } else {
                    lastvidlink.setAttribute('style', 'color: var(--textcolor3)')
                    lastvidlink.textContent = `最後に見た動画が保存されていません`
                }
                elem.appendChild(lastvidlink)
                let nextvidlink = document.createElement('a')
                nextvidlink.target = "_blank"
                nextvidlink.rel = "noopener noreferrer"
                nextvidlink.classList.add('stockedseries-row-link', 'stockedseries-row-vidlink')
                if (object.nextVidID != undefined && object.nextVidID != undefined) {
                    nextvidlink.textContent = `次の動画: ${object.nextVidName}`
                    nextvidlink.setAttribute('href', `https://www.nicovideo.jp/watch/${object.nextVidID}?ref=series&playlist=${playlist}&transition_type=series&transition_id=${object.seriesID}`)
                    nextvidlink.addEventListener('click',linkAction)
                } else {
                    nextvidlink.setAttribute('style', 'color: var(--textcolor3)')
                    nextvidlink.textContent = `次の動画が保存されていません`
                }
                elem.appendChild(nextvidlink)
                // list expand button
                let expandeplistbutton = document.createElement('button')
                expandeplistbutton.id = 'expandeplist'
                expandeplistbutton.textContent = '▼ 展開'
                expandeplistbutton.type = 'button'
                elem.appendChild(expandeplistbutton)
                // push to stockedseries container
                document.querySelector('.stockedserieslist-container').appendChild(elem)
            })
            $(document).on('click', '#removeseries', function () {
                manageSeriesStock(this.closest('.stockedseries-row').id).then(() => {
                    this.closest('.stockedseries-row').remove()
                    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
                    getStorageData.then((str) => {
                        if (str.stockedseries == undefined || str.stockedseries == null) {
                            titleelem.textContent = "シリーズストック (0)"
                        } else {
                            titleelem.textContent = "シリーズストック (" + str.stockedseries.length + ")"
                        }
                    })
                })

            })
            $(document).on('click', '#togglelock', function () {
                console.log(this.textContent)
                if (this.textContent == 'lock') {
                    $(".stockedserieslist-container").sortable({
                        "axis": "y",
                        "update": function (event, ui) {
                            //console.log()
                            let sortlist = $('.stockedserieslist-container').sortable("toArray")
                            var getNewStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
                            getNewStorageData.then(function (newresult) {
                                let currentstock = newresult.stockedseries
                                currentstock.sort((a, b) => sortlist.indexOf(a.seriesID) - sortlist.indexOf(b.seriesID))
                                //console.log(currentstock)
                                chrome.storage.sync.set({
                                    "stockedseries": currentstock
                                })
                            })
                        }
                    }
                    )
                    this.textContent = "lock_open"
                    this.title = "ロック状態に変更"
                    document.querySelector('.stockedserieslist-container').classList.add('stocklist-unlocked')
                } else {
                    $(".stockedserieslist-container").sortable("destroy")
                    this.textContent = "lock"
                    this.title = "ロックを解除"
                    document.querySelector('.stockedserieslist-container').classList.remove('stocklist-unlocked')
                }
            })
            $(document).on('click', '#expandeplist', function () {
                // このボタンが押された行の要素
                let thisrow = this.closest('.stockedseries-row')
                if (thisrow.classList.contains("eplistopen")) {
                    document.getElementById(`${thisrow.id}-eplist`).classList.add('eplisthidden')
                    thisrow.classList.add('eplistclosed')
                    this.textContent = "▼ 展開"
                    thisrow.classList.remove("eplistopen")
                } else if (thisrow.classList.contains("eplistclosed")) {
                    document.getElementById(`${thisrow.id}-eplist`).classList.remove('eplisthidden')
                    thisrow.classList.add('eplistopen')
                    this.textContent = "▲  閉じる"
                    thisrow.classList.remove("eplistclosed")
                } else {
                    // エピソードリストのコンテナ用意
                    let episodecontainer = document.createElement('div')
                    episodecontainer.classList.add('stockedseries-episodecontainer')
                    episodecontainer.id = `${thisrow.id}-eplist`
                    // プレイリストjson用意
                    let playlistjson = btoa(`{"type":"series","context":{"seriesId":${thisrow.id}}}`)
                    // GSIを呼ぶ
                    let callGSI = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "getSeriesInfo", "seriesID": thisrow.id }, resolve))
                    callGSI.then(res => {
                        console.log(res)
                        if (res.meta != undefined && res.meta.status != undefined && res.meta.status == 200) {
                            // オーナーコンテナーを用意
                            let ownerrowelem = document.createElement('div')
                            ownerrowelem.classList.add('stockedseries-ownerrow')
                            if (res.data.detail.owner.type == "channel") {
                                // span用意
                                let ownerrownameelem = document.createElement('span')
                                ownerrownameelem.textContent = `チャンネル: `
                                // リンク用意
                                let ownerrowlinkelem = document.createElement('a')
                                ownerrowlinkelem.classList.add('stockedseries-ownerrowlink')
                                ownerrowlinkelem.textContent = `${res.data.detail.owner.channel.name}`
                                ownerrowlinkelem.href = `https://ch.nicovideo.jp/${res.data.detail.owner.channel.id}`
                                // spanをオーナーコンテナに入れる
                                ownerrowelem.appendChild(ownerrownameelem)
                                // リンクも入れる
                                ownerrowelem.appendChild(ownerrowlinkelem)
                            } else if (res.data.detail.owner.type == "user") {
                                // user
                                // span用意
                                let ownerrownameelem = document.createElement('span')
                                ownerrownameelem.textContent = `ユーザー: `
                                // リンク用意
                                let ownerrowlinkelem = document.createElement('a')
                                ownerrowlinkelem.classList.add('stockedseries-ownerrowlink')
                                ownerrowlinkelem.textContent = `${res.data.detail.owner.user.nickname}`
                                ownerrowlinkelem.href = `https://www.nicovideo.jp/user/${res.data.detail.owner.user.id}`
                                if (res.data.detail.owner.user.isPremium) {
                                    // プレだったら色変更
                                    ownerrowlinkelem.style = "color: #fcb205"
                                }
                                // spanをオーナーコンテナに入れる
                                ownerrowelem.appendChild(ownerrownameelem)
                                // リンクも入れる
                                ownerrowelem.appendChild(ownerrowlinkelem)
                            }
                            let updatedateelem = document.createElement('div')
                            let fetchdate = new Date(res.fetchdate)
                            updatedateelem.textContent = `最終取得:` + fetchdate.toLocaleString()
                            updatedateelem.classList.add('stockedseries-fetchdate')
                            ownerrowelem.appendChild(updatedateelem)
                            // DOMに反映
                            episodecontainer.appendChild(ownerrowelem)
                            // 一個ずつ処理
                            res.data.items.forEach(element => {
                                // video.idでsmIDが取れる、video.titleで動画タイトルが取れる
                                // 行コンテナ
                                let episoderowelem = document.createElement('div')
                                episoderowelem.id = element.video.id
                                episoderowelem.classList.add('stockedseries-episoderow')
                                // リンク
                                let episoderowlink = document.createElement('a')
                                episoderowlink.classList.add('stockedseries-episoderowlink')
                                episoderowlink.textContent = element.video.title
                                // プレイリスト情報付与してhref追加
                                episoderowlink.href = `https://www.nicovideo.jp/watch/${element.video.id}?ref=series&playlist=${playlistjson}&transition_type=series&transition_id=${thisrow.id}`
                                // 行コンテナに追加
                                episoderowelem.appendChild(episoderowlink)
                                // 行コンテナをコンテナーに追加
                                episodecontainer.appendChild(episoderowelem)
                                // リンクにイベントをサブスクライブ
                                episoderowlink.addEventListener('click',linkAction)
                            });
                        } else {
                            // オーナーコンテナーを用意
                            let ownerrowelem = document.createElement('div')
                            ownerrowelem.classList.add('stockedseries-ownerrow')
                            if (res.meta != undefined && res.meta.status != undefined && res.meta.errorCode != undefined) {
                                ownerrowelem.textContent = `シリーズ情報の取得に失敗しました: ${res.meta.status} ${res.meta.errorCode}`
                            } else if (res.reason != undefined) {
                                ownerrowelem.textContent = `シリーズ情報の取得に失敗しました: ${res.reason}`
                            } else {
                                ownerrowelem.textContent = `不明なエラーが発生したためシリーズ情報の取得に失敗しました`
                            }
                            ownerrowelem.style = "color: #f00"
                            if (res.fetchdate != undefined) {
                                let updatedateelem = document.createElement('div')
                                let fetchdate = new Date(res.fetchdate)
                                updatedateelem.textContent = `最終取得:` + fetchdate.toLocaleString()
                                updatedateelem.classList.add('stockedseries-fetchdate')
                                ownerrowelem.appendChild(updatedateelem)
                            }
                            // DOMに反映
                            episodecontainer.appendChild(ownerrowelem)
                        }
                        // DOMに反映
                        thisrow.appendChild(episodecontainer)
                    })
                    this.textContent = "▲ 閉じる"
                    thisrow.classList.add('eplistopen')
                }


            })
        } else {
            if (result.quickpanelisclosed != true) {
                let elem_nothing_head = document.createElement('div')
                elem_nothing_head.textContent = ":o"
                elem_nothing_head.classList.add('nothing-here-head')
                // Push Elem
                document.getElementById('dashboard').appendChild(elem_nothing_head)
                let elem_nothing = document.createElement('div')
                elem_nothing.innerHTML = "ここはPepperMint+のクイックパネルです。<br>「クイック設定を開く」もしくはタイトルをクリックして、設定に移動しましょう。<br>シリーズストックを有効化していると、ここにストック中のシリーズが表示されます。"
                elem_nothing.classList.add('nothing-here')
                // Push Elem
                document.getElementById('dashboard').appendChild(elem_nothing)
                let elem_nothing_discard_container = document.createElement('div')
                elem_nothing_discard_container.classList.add('nothing-here-discard-container')
                let elem_nothing_discard = document.createElement('a')
                elem_nothing_discard.innerHTML = "今後表示しない"
                elem_nothing_discard.classList.add('nothing-here')
                elem_nothing_discard.classList.add('nothing-here-discard')
                elem_nothing_discard.id = 'nothing-here-discard'
                // Push Elem
                elem_nothing_discard_container.appendChild(elem_nothing_discard)
                elem_nothing_discard.addEventListener('click', function () {
                    elem_nothing.remove()
                    elem_nothing_head.remove()
                    elem_nothing_discard.remove()
                    chrome.storage.sync.set(
                        {
                            "quickpanelisclosed": true
                        }
                    );
                })
                document.getElementById('dashboard').appendChild(elem_nothing_discard_container)
            }
        }
        if (result.enablenicorepotab == true) {
            document.getElementById('tabbutton-nicorepo').classList.remove('disabled')
            let callGRN = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "getRecentNicorepo" }, resolve))
            callGRN.then(res => {
                console.log(res)
                let lastfetchdateelem = document.createElement('div')
                lastfetchdateelem.textContent = `最終更新: ${res.fetchdate}`
                document.getElementById('nicorepo').appendChild(lastfetchdateelem)
            })
        }
    }, onError);
}

$("#settings-form").on('change', saveOptions);
document.addEventListener("DOMContentLoaded", makeElem);
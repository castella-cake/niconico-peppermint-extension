chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("pages/welcome.html")
        });
    } else if (details.reason == "update") {
        //chrome.tabs.create({url: chrome.runtime.getURL("pages/update.html")});
    }
    chrome.contextMenus.create({
        id: "dicsearch",
        title: 'ニコニコ大百科で %s を検索',
        contexts: ["selection"]
    });
    //chrome.alarms.create('seriesStock_Refresh', {delayInMinutes:10, PeriodInMinutes: 120})
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "dicsearch":
            let dicsearchlink = 'https://dic.nicovideo.jp/s/al/t/' + info.selectionText
            chrome.tabs.create({
                url: dicsearchlink
            });
            break;
    }
})
function generateActionTrackId() {
    return new Promise((resolve, reject) => {
        try {
            let atc_first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            let atc_last = "0123456789"
            let ati_firststr = ""
            let ati_laststr = ""
            let ati_str = ""
            for (let i = 0; i < 10; i++) {
                console.log(i)
                ati_firststr += atc_first[Math.floor(Math.random() * atc_first.length)]
            }
            for (let i = 0; i < 24; i++) {
                console.log(i)
                ati_laststr += atc_last[Math.floor(Math.random() * atc_last.length)]
            }
            ati_str = ati_firststr + "_" + ati_laststr
            resolve(ati_str)
        } catch (err) {
            reject(err)
        }
    })
}
function getSeriesInfo(seriesid, usecache = true) {
    // シリーズ情報を取得してキャッシュします。あくまでこいつは新規取得に特化しています。
    // なので、キャッシュがある場合はそっちから読むとかそんな動作はしません。
    return new Promise((resolve,reject) => {
        try {
            let getStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));
            getStorageData.then((storage) => {
                // ストレージにあるseriesidのキャッシュがnullでもundefinedでもなくて極めつけにusecacheがtrueならストレージのものを返す
                if ( storage.seriesdatacache[seriesid] != null && storage.seriesdatacache[seriesid] != undefined && usecache == true) {
                    resolve(storage.seriesdatacache[seriesid])
                } else {
                    // そうじゃなければATI作ってfetchする
                    generateActionTrackId().then((id) => {
                        fetch(`https://nvapi.nicovideo.jp/v1/series/${seriesid}?_frontendId=6&_frontendVersion=0&actionTrackId=${id}`, { 'method': 'GET' }).then((res) => {
                            if (res.ok) {
                                // okだったらtextを取る
                                res.text().then((data) => {
                                    // objにパースして200かどうか確認する
                                    let dataobj = JSON.parse(data)
                                    dataobj[fetchdate] = new Date()
                                    if (dataobj.meta.status == 200) {
                                        // **ローカル**のストレージを呼ぶ
                                            // nullかundefinedだったら直接突っ込む
                                            if (storage.seriesdatacache == null || storage.seriesdatacache == undefined) {
                                                chrome.storage.local.set({"seriesdatacache":{[seriesid]: dataobj}})
                                                resolve(dataobj)
                                            } else {
                                                // そうじゃなければ、ストレージの内容をvarにコピーして、変更したcacheを付け足して、ストレージに突っ込む
                                                let seriescache = JSON.parse(JSON.stringify(storage.seriesdatacache))
                                                seriescache[seriesid] = dataobj
                                                chrome.storage.local.set({"seriesdatacache":seriescache})
                                                resolve(dataobj)
                                            }
                                    } else {
                                        // 200じゃなかったらrejectしてステータス返す
                                        reject(dataobj.meta.status)
                                    }
                                })
                            } else {
                                // そもそも呼べなかったらrejectしてステータス返す
                                reject(res.status)
                            }
                        })
                    })
                }
            })
            
        } catch (err) {
            reject(err)
        }
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "getThumbUrl") {
        if (message.smID != null || message.smID != undefined) {
            fetch("https://ext.nicovideo.jp/api/getthumbinfo/" + message.smID, { 'method': 'GET' }).then((res) => {
                if (res.ok) {
                    res.text().then((data) => {
                        sendResponse(data)
                    })
                } else {
                    sendResponse({
                        'status': false,
                        'reason': 'API fetch failed'
                    });
                }
            })
            return true;
        } else {
            sendResponse({
                'status': false,
                'reason': 'smID is not defined'
            });
            return true;
        }
    } else if (message.type == "getRankingXml") {
        fetch("https://www.nicovideo.jp/ranking/genre/all?rss=2.0", { method: 'GET' }).then((res) => {
            if (res.ok) {
                res.text().then((data) => {
                    //console.log(data)
                    sendResponse(data)
                })
            } else {
                sendResponse({
                    'status': false,
                    'reason': 'Page fetch failed'
                });
            }
        })
        return true;
    } else if (message.type == "getSeriesInfo") {
        if (message.seriesID != null || message.seriesID != undefined) {
            getSeriesInfo(message.seriesID)
            .then((data) => {
                sendResponse(data)
            })
            .catch((reason) => {
                sendResponse({
                    'status': false,
                    'reason': `getSeriesInfo() failed: ${reason}`
                });
            })
            return true;
        } else {
            sendResponse({
                'status': false,
                'reason': 'seriesID is not defined'
            });
            return true;
        }
    } else {
        sendResponse({
            'status': false,
            'reason': 'Invalid type or type is not defined'
        });
        return true;
    }
    //sendResponse({'status': false,'reason': 'Invalid error'});

});
/* シリーズストックのエピソードリスト取得
    目的: 見たいエピソードが明示的にある場合に、現状だとシリーズページに移動して開かないといけない
        また、現状最後のエピソードまで見てから新しいエピソードがある場合でも次の動画に表示されない
        そのため、やはりシリーズを定期取得してキャッシュする仕組みが必要だと感じた
    - 2時間おきに新しいリストを取得する
        - 新しいエピソードがある(キャッシュ済みのリストと違う)なら、NEW扱いにしてツールバーに通知バッジを表示する
            ツールバーボタンでクイックパネルが開く仕様はこのためにそうした、そもそもvideo_topとホームだけってのはあまりに不便だし
            このおかげでふと見たくなった時にシリーズストックのリストや動画に円滑にアクセスできるようになっている
        - リストをストレージ(ローカル)にキャッシュする
    - キャッシュのないままクイックパネルなどからリストの表示がされたなら、取得してストレージにキャッシュする
        - これをスムーズに行うために、メッセージでbackgroundにgetSeriesListを送ってあとはbackgroundサイドで取得やキャッシュを行い、ページ側に渡すことにする
    - actionTrackIdは結局どうすれば？呼ぶ度にランダムにするように言われているが、それなら運営側はどのようにアクションをトラックしているのか疑問
        少なくともレートリミットをこれで避けられるようなザル仕様ではないはず ...ないよな？
        仮に固定にしたほうが良いのであれば、ストレージに保存してないときは生成あるならそれを使うようにする
        だけど呼ぶたびにランダムにしてもそんなデメリットはないはず
    - レートリミットを避けるため、10シリーズを超える場合は残りを次に回すべきかもしれない
        しかしどうやってそれを実現するかは要検討 serieslistupdatequeueに残りを突っ込む？
        アラームで2時間おきに発火するものと、10分おきに発火するものを用意するってそれじゃ偶然アラームがあと5秒で発火します！！みたいな状況で意味がない！！
        setTimeoutでforとかに30s程度の遅延付きで実行すべきかもしれない、ただし約250~のシリーズストックが有る場合、全てが台無しになる可能性がある
        15sでもレートリミットは避けられるかもしれない、それでも480~くらいに上がるだけだが、さすがに450以上になったら自動更新自体を止めてユーザーに警告を出すことにする
        よく考えたらそもそも100以上のシリーズを15s毎に呼ぶのはあまりよろしくないのでは？それなら30sで200以上になったら止める仕様の方が優しいよな
        遅延を2分とかあまりにも長くするとServiceWorkerはせっかちなので蹴っ飛ばしてしまう
*/
/*
chrome.alarms.onAlerm.addListener(function(e) {
    if (e.name == 'seriesStock_Refresh') {
        let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
        getStorageData.then(function (result) {
            if (result.enableseriesstock) {
                fetch('https://nvapi.nicovideo.jp/v1/series/360103?_frontendId=6&_frontendVersion=0')
            }
        })
    }
})*/
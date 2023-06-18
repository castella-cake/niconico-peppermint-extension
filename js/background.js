chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("pages/welcome.html")
        });
    }
    chrome.contextMenus.create({
        id: "dicsearch",
        title: 'ニコニコ大百科で %s を検索',
        contexts: ["selection"]
    });
    //chrome.alarms.create('seriesStock_Refresh', {delayInMinutes:60, PeriodInMinutes: 360})
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
            for (var i = 0; i < 10; i++) {
                console.log(i)
                ati_firststr += atc_first[Math.floor(Math.random() * atc_first.length)]
            }
            for (var i = 0; i < 24; i++) {
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
    } else if (message.type == "getVideoInfo") {
        if (message.smID != null || message.smID != undefined) {
            generateActionTrackId().then((id) => {
                fetch("https://www.nicovideo.jp/api/watch/v3_guest/" + message.smID + "?_frontendId=6&_frontendVersion=0&actionTrackId=" + id, { 'method': 'GET' }).then((res) => {
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
            })
            return true;
        } else {
            sendResponse({
                'status': false,
                'reason': 'smID is not defined'
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
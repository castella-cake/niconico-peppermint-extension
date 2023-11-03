const manifestData = chrome.runtime.getManifest();
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("pages/welcome.html")
        });
    } else if (details.reason == "update" && details.previousVersion !== manifestData.version) {
        if (chrome.browserAction != undefined) {
            chrome.browserAction.setBadgeText({ text: "▲" })
            chrome.browserAction.setBadgeBackgroundColor({ color: "#169cf0"});
        } else if (chrome.action != undefined) {
            chrome.action.setBadgeText({ text: "▲" })
            chrome.action.setBadgeBackgroundColor({ color: "#169cf0"});
        }
        chrome.storage.local.set({ "versionupdated": true })
    }
    chrome.contextMenus.create({
        id: "dicsearch",
        title: 'ニコニコ大百科で %s を検索',
        contexts: ["selection"],
        visible: false
    });
    chrome.alarms.create('seriesStock_Refresh', { delayInMinutes: 0, periodInMinutes: 120 })
    chrome.alarms.create('nicoRepo_Refresh', { delayInMinutes: 0, periodInMinutes: 45 })
    //chrome.alarms.create('dynamicPatch_Refresh', { delayInMinutes: 0, periodInMinutes: 360 })
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then((storage) => {
        if (storage.pediacontextsearch == true || storage.pediacontextsearch == false) {
            chrome.contextMenus.update( "dicsearch", {visible: storage.pediacontextsearch});
        } else {
            chrome.contextMenus.update( "dicsearch", {visible: false});
        }
    })
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
                //console.log(i)
                ati_firststr += atc_first[Math.floor(Math.random() * atc_first.length)]
            }
            for (let i = 0; i < 24; i++) {
                //console.log(i)
                ati_laststr += atc_last[Math.floor(Math.random() * atc_last.length)]
            }
            ati_str = ati_firststr + "_" + ati_laststr
            resolve(ati_str)
        } catch (err) {
            reject(err)
        }
    })
}
function getSeriesInfo(seriesid, cachemode = 0) {
    // シリーズ情報を取得してキャッシュします。あくまでこいつは新規取得に特化しています。
    // なので、キャッシュがある場合はそっちから読むとかそんな動作はしません。→するようになりました
    // cachemode 0 => use cache 1 => no cache 2 => no cache and badge update
    return new Promise((resolve, reject) => {
        try {
            let getStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));
            getStorageData.then((storage) => {
                // ストレージにあるseriesidのキャッシュがnullでもundefinedでもなくて極めつけにusecacheがtrueならストレージのものを返す
                if (storage.seriesdatacache != undefined && (storage.seriesdatacache[seriesid] != null && storage.seriesdatacache[seriesid] != undefined && cachemode == 0)) {
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
                                    let currentdate = new Date()
                                    dataobj["fetchdate"] = currentdate.toString()
                                    if (dataobj.meta.status == 200) {
                                        // **ローカル**のストレージを呼ぶ
                                        // nullかundefinedだったら直接突っ込む
                                        if (storage.seriesdatacache == null || storage.seriesdatacache == undefined) {
                                            chrome.storage.local.set({ "seriesdatacache": { [seriesid]: dataobj } })
                                            resolve(dataobj)
                                        } else {
                                            // そうじゃなければ、ストレージの内容をvarにコピーして、変更したcacheを付け足して、ストレージに突っ込む
                                            let seriescache = JSON.parse(JSON.stringify(storage.seriesdatacache))
                                            seriescache[seriesid] = dataobj
                                            chrome.storage.local.set({ "seriesdatacache": seriescache })
                                            if (cachemode == 2) {
                                                // キャッシュがundefinedじゃなくてシリーズIDのキャッシュも過去にされててdataが今持ってるものと違うなら+を表示
                                                if (storage.seriesdatacache != undefined && (storage.seriesdatacache[seriesid] != undefined && dataobj.data.totalCount != storage.seriesdatacache[seriesid].data.totalCount)) {
                                                    if (chrome.browserAction != undefined) {
                                                        chrome.browserAction.setBadgeText({ text: "S" })
                                                    } else if (chrome.action != undefined) {
                                                        chrome.action.setBadgeText({ text: "S" })
                                                    }
                                                }
                                                resolve(dataobj)
                                            } else {
                                                resolve(dataobj)
                                            }
                                        }
                                    } else {
                                        // 200じゃなかったらreject
                                        reject(dataobj)
                                    }
                                })
                            } else {
                                // そもそも呼べなかったらrejectしてステータス返す
                                reject({ "meta": { "status": res.status, "reason": "APIの呼び出しに失敗しました" } })
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
function getRecentNicorepo(cachemode = 0) {
    // ニコレポを取得してキャッシュします。
    // cachemode 0 => use cache 1 => no cache 2 => no cache and badge update
    return new Promise((resolve, reject) => {
        try {
            let getStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));
            getStorageData.then((storage) => {
                // キャッシュが使用可能なら使用する
                if (storage.nicorepocache != undefined && (storage.nicorepocache != null && storage.nicorepocache != undefined && cachemode == 0)) {
                    resolve(storage.nicorepocache)
                } else {
                    // そうじゃなければfetch
                    fetch(`https://api.repoline.nicovideo.jp/v1/timelines/nicorepo/last-1-month/my/pc/entries.json`, { 'method': 'GET' }).then((res) => {
                        if (res.ok) {
                            // okだったらtextを取る
                            res.text().then((data) => {
                                // objにパースして200かどうか確認する
                                let dataobj = JSON.parse(data)
                                let currentdate = new Date()
                                dataobj["fetchdate"] = currentdate.toString()
                                if (dataobj.meta.status == 200) {
                                    if (cachemode == 2) {
                                        // ニコレポキャッシュがundefinedじゃないなら
                                        if ( storage.nicorepocache != undefined && storage.nicorepocache.data ) {
                                            let oldidarray = storage.nicorepocache.data.map(elem => elem.id)
                                            let newidarray = dataobj.data.map(elem => elem.id)
                                            //console.log(`OLD: ${JSON.stringify(oldidarray)}`)
                                            //console.log(`NEW: ${JSON.stringify(newidarray)}`)
                                            //console.log(JSON.stringify(oldidarray) != JSON.stringify(newidarray))
                                            if (JSON.stringify(oldidarray) != JSON.stringify(newidarray)) {
                                                if (chrome.browserAction != undefined) {
                                                    chrome.browserAction.setBadgeText({ text: "R" })
                                                } else if (chrome.action != undefined) {
                                                    chrome.action.setBadgeText({ text: "R" })
                                                }
                                            }

                                        }
                                    } 
                                    chrome.storage.local.set({ "nicorepocache": dataobj })
                                    resolve(dataobj)
                                } else {
                                    // 200じゃなかったらreject
                                    reject(dataobj)
                                }
                            })
                        } else {
                            // そもそも呼べなかったらrejectしてステータス返す
                            reject({ "meta": { "status": res.status, "reason": "APIの呼び出しに失敗しました" } })
                        }
                    })
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}
function getDynamicPatch(cachemode = 0) {
    // ダイナミックパッチを取得してキャッシュします。
    // cachemode 0 => use cache 1 => no cache
    return new Promise((resolve, reject) => {
        try {
            let getStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));
            getStorageData.then((storage) => {
                // キャッシュが使用可能なら使用する
                if (storage.dynamicpatchcache != undefined && (storage.dynamicpatchcache != null && storage.dynamicpatchcache != undefined && cachemode == 0)) {
                    resolve(storage.dynamicpatchcache)
                } else {
                    // そうじゃなければfetch
                    fetch(`https://raw.githubusercontent.com/castella-cake/niconico-peppermint-extension/master/dynamicpatch/updates.json`, { 'method': 'GET' }).then((res) => {
                        if (res.ok) {
                            // okだったらtextを取る
                            res.text().then((data) => {
                                // objにパースして200かどうか確認する
                                let dataobj = JSON.parse(data)
                                let currentdate = new Date()
                                dataobj["fetchdate"] = currentdate.toString()
                                if (dataobj.meta.status == 200) {
                                    chrome.storage.local.set({ "dynamicpatchcache": dataobj })
                                    resolve(dataobj)
                                } else {
                                    // 200じゃなかったらreject
                                    reject(dataobj)
                                }
                            })
                        } else {
                            // そもそも呼べなかったらrejectしてステータス返す
                            reject({ "meta": { "status": res.status, "reason": "Fetch failed" } })
                        }
                    })
                }
            })
        } catch (err) {
            reject(err)
        }
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "getThumbXml") {
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
    } else if (message.type == "getRecentNicorepo") {
        const updateType = message.updateType ?? 0
        getRecentNicorepo(updateType)
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
    } else if (message.type == "openThisNCLink") {
        if (message.href != null || message.href != undefined) {
            try {
                chrome.tabs.query({ 'active': true, 'currentWindow': true }, tabarray => {
                    console.log(tabarray)
                    const activeURL = tabarray[0].url
                    if (activeURL != undefined && activeURL.indexOf('www.nicovideo.jp') != -1) {
                        chrome.tabs.update(tabarray[0].id, { url: message.href })
                    } else {
                        chrome.tabs.create({ url: message.href });
                    }
                    sendResponse({ 'status': true });
                })
                return true;
            } catch (err) {
                sendResponse({
                    'status': false,
                    'reason': `Unexpected error:${err}`
                });
                return true;
            }
        } else {
            sendResponse({
                'status': false,
                'reason': 'href is not defined'
            });
            return true;
        }
    } else if (message.type == "openThisLinkNewTab") {
        if (message.href != null || message.href != undefined) {
            try {
                chrome.tabs.create({ url: message.href });
                sendResponse({ 'status': true });
                return true;
            } catch (err) {
                sendResponse({
                    'status': false,
                    'reason': `Unexpected error:${err}`
                });
                return true;
            }
        } else {
            sendResponse({
                'status': false,
                'reason': 'href is not defined'
            });
            return true;
        }
    } else if (message.type == "updateContextMenuState") {
        let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
        getStorageData.then((storage) => {
            if (storage.pediacontextsearch == true || storage.pediacontextsearch == false) {
                chrome.contextMenus.update( "dicsearch", {visible: storage.pediacontextsearch});
            } else {
                chrome.contextMenus.update( "dicsearch", {visible: false});
            }
            sendResponse({
                'status': false,
            });
            return true;
        })
    } else {
        sendResponse({
            'status': false,
            'reason': 'Invalid type or type is not defined'
        });
        return true;
    }
    //sendResponse({'status': false,'reason': 'Invalid error'});
    /*
    fetch("https://public.api.nicovideo.jp/v1/user/oshirasebox/box.json?offset=0&importantOnly=false", {
    "credentials": "include",
    "headers": {
        "X-Request-With": "https://www.nicovideo.jp/",
        "X-Frontend-Id": "6",
    },
    "method": "GET"
});
    */

});

chrome.alarms.onAlarm.addListener(function (e) {
    if (e.name == 'seriesStock_Refresh') {
        //console.log('seriesstock refresh')
        // ストレージ取得
        let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
        getStorageData.then(function (result) {
            // 有効でかつストック中がundefinedじゃない
            if (result.enableseriesstock && result.stockedseries != undefined) {
                // lengthが300以下なら
                if (result.stockedseries.length < 300) {
                    // forEachで一個ずつ処理
                    result.stockedseries.forEach((element, i) => {
                        setTimeout(() => {
                            //console.log(element.seriesID)
                            // キャッシュなしで取得(これでキャッシュされる)
                            getSeriesInfo(element.seriesID, 2)
                        }, i * 10000);
                        // i * 15000msで10sおきに実行
                    });
                }
            }
        })
    } else if (e.name == 'nicoRepo_Refresh') {
        let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
        getStorageData.then(function (result) {
            // 有効でかつストック中がundefinedじゃない
            if (result.enablenicorepotab) {
                getRecentNicorepo(2)
            }
        })
    }
})
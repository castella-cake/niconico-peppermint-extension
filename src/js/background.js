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
        if (
            details.previousVersion.split(".")[0] != manifestData.version.split(".")[0]
            || (
                details.previousVersion.split(".")[0] == "2" && details.previousVersion.split(".")[1] == "0" && 
                manifestData.version.split(".")[0] == "2" && manifestData.version.split(".")[1] == "1"
            )
        ) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("pages/update.html")
            });
        }
        chrome.storage.local.set({ "versionupdated": true })
    }
    chrome.contextMenus.create({
        id: "dicsearch",
        title: 'ニコニコ大百科で %s を検索',
        contexts: ["selection"],
        visible: false
    });
    chrome.alarms.create('seriesStock_Refresh', { delayInMinutes: 1, periodInMinutes: 120 })
    chrome.alarms.create('nicoRepo_Refresh', { delayInMinutes: 1, periodInMinutes: 45 })
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
    const atc_first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const atc_last = "0123456789"
    let ati_firststr = ""
    let ati_laststr = ""
    for (let i = 0; i < 10; i++) {
        //console.log(i)
        ati_firststr += atc_first[Math.floor(Math.random() * atc_first.length)]
    }
    for (let i = 0; i < 24; i++) {
        //console.log(i)
        ati_laststr += atc_last[Math.floor(Math.random() * atc_last.length)]
    }
    return ati_firststr + "_" + ati_laststr
}
// #region getVideoInfo
function getVideoInfo(smId) {
    return new Promise(async (resolve, reject) => {
        try {
            // responseType=jsonで取得。
            const response = await fetch(`https://www.nicovideo.jp/watch/${smId}?responseType=json`, {
                "credentials": "include",
                "headers": {
                    "User-Agent": `PepperMintPlus/${manifestData.version}`,
                },
                "method": "GET"
            })
            if ( !response.ok ) reject("Response is not ok")
            const responseJson = await response.json()
            if ( responseJson.meta.status !== 200 ) reject(responseJson.meta.status)
            resolve(responseJson)
        } catch (err) {
            reject(err)
        }
    })
}
// #endregion
function getSeriesInfo(seriesid, cachemode = 0) {
    // シリーズ情報を取得してキャッシュします。
    // キャッシュモードが0の場合はキャッシュを返します。
    // cachemode 0 => use cache 1 => no cache 2 => no cache and badge update
    return new Promise((resolve, reject) => {
        try {
            let getStorageData = new Promise((resolve) => chrome.storage.local.get(null, resolve));
            getStorageData.then((storage) => {
                // ストレージにあるseriesidのキャッシュがnullでもundefinedでもなくて極めつけにusecacheがtrueならストレージのものを返す
                if (storage.seriesdatacache != undefined && (storage.seriesdatacache[seriesid] != null && storage.seriesdatacache[seriesid] != undefined && cachemode == 0)) {
                    resolve(storage.seriesdatacache[seriesid])
                } else {
                    fetch(`https://nvapi.nicovideo.jp/v2/series/${seriesid}`, {
                        'method': 'GET',
                        "headers": {
                            "X-Frontend-Id": "6",
                            "X-Frontend-Version": "0",
                        },
                    }).then((res) => {
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
                                        const seriescache = {...storage.seriesdatacache, [seriesid]: dataobj};
                                        chrome.storage.local.set({ "seriesdatacache": seriescache });
                                        if (cachemode == 2) {
                                            // キャッシュがundefinedじゃなくてシリーズIDのキャッシュも過去にされててdataが今持ってるものと違うなら+を表示
                                            if (storage.seriesdatacache != undefined && (storage.seriesdatacache[seriesid] != undefined && dataobj.data.totalCount != storage.seriesdatacache[seriesid].data.totalCount)) {
                                                if (chrome.browserAction != undefined) {
                                                    chrome.browserAction.setBadgeText({ text: "S" })
                                                    chrome.browserAction.setBadgeBackgroundColor({ color: "#1dab35"});
                                                } else if (chrome.action != undefined) {
                                                    chrome.action.setBadgeText({ text: "S" })
                                                    chrome.action.setBadgeBackgroundColor({ color: "#1dab35"});
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
                }
            })
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}

function getSeriesNameFromPage(targetId) {
    const pathArray = location.pathname.split("/")
    if ( pathArray[1] == "user" && pathArray[3] == "series" && pathArray[4].startsWith(targetId) ) {
        const seriesNameElem = document.querySelector(".SeriesDetailHeader-bodyTitle")
        if ( seriesNameElem ) {
            return { status: true, name: seriesNameElem.textContent }
        } else {
            return { status: false }
        }
    } else {
        return { status: false }
    }
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
            }).catch((err) => {
                sendResponse({
                    'status': false,
                    'reason': 'API fetch failed: '  + err
                });
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
                    'reason': `getRecentNicorepo() failed: ${reason}`
                });
            })
        return true;
    } else if (message.type == "openThisNCLink") {
        if (message.href != null || message.href != undefined) {
            try {
                chrome.tabs.query({ 'active': true, 'currentWindow': true }, tabarray => {
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
    } else if (message.type == "getActiveNCState") {
        if ( message.getType == "series" ) {
            try {
                chrome.tabs.query({ 'active': true, 'currentWindow': true }, tabarray => {
                    if ( tabarray && tabarray[0] ) {
                        const activeURL = tabarray[0].url
                        const pathArray = activeURL.replace(/\?.*$/, "").replace("https://www.nicovideo.jp/", "").split("/");
                        if (activeURL && activeURL.indexOf('www.nicovideo.jp') != -1 && pathArray.length >= 4 && pathArray[0] == "user" && pathArray[2] == "series") {
                            new Promise((resolve) => chrome.scripting.executeScript({
                                target: { tabId: tabarray[0].id },
                                func: getSeriesNameFromPage
                            }, resolve)).then(res => {
                                if ( res && res.status == true && res.name ) {
                                    sendResponse({ 'status': true, 'seriesId': pathArray[3], 'name': res.name });
                                    return true;
                                } else {
                                    sendResponse({ 'status': true, 'seriesId': pathArray[3] });
                                    return true;
                                }
                            })
                        } else {
                            sendResponse({ 'status': false, 'reason': 'Current tab is not Nicovideo or not userpage.' });
                            return true;
                        }
                    } else {
                        sendResponse({ 'status': false, 'reason': 'Cannot get tab infomation.' });
                        return true;
                    }

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
                'reason': 'getType is not defined'
            });
            return true;
        }
    } else if ( message.type === "updateSeriesStockState" ) {
        let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
        getStorageData.then((storage) => {
            // ストックされたシリーズが存在しないならreturn
            if ( !storage.stockedseries || storage.stockedseries.length <= 0 ) {
                sendResponse({
                    'status': false,
                    'reason': 'Stocked series is empty'
                });
                return true;
            }
            // 動画情報を取得する
            getVideoInfo(message.smId).then(videoInfo => {
                console.log(videoInfo)
                // データと応答とシリーズ情報が存在する？
                if ( videoInfo.data && videoInfo.data.response && videoInfo.data.response.series ) {
                    // シリーズ情報を代入して、ストック情報をコピー
                    const thisSeriesInfo = videoInfo.data.response.series
                    console.log(thisSeriesInfo)
                    const stockedseriesarray = JSON.parse(JSON.stringify(storage.stockedseries))
                    // ストック情報を走査して、現在の動画が属しているシリーズに一致する要素を書き換える
                    stockedseriesarray.forEach((object) => {
                        // 型が違う！！===にしないように
                        if (object.seriesID == thisSeriesInfo.id) {
                            object.lastVidID = message.smId
                            object.lastVidName = videoInfo.data.response.video.title
                            object.nextVidID = thisSeriesInfo.video.next.id
                            object.nextVidName = thisSeriesInfo.video.next.title
                            //console.log(object)
                        }
                    })
                    // 保存してステータス返却
                    chrome.storage.sync.set({
                        "stockedseries": stockedseriesarray
                    })
                    sendResponse({ 'status': true });
                    return true;
                }
            }).catch(err => {
                sendResponse({
                    'status': false,
                    'reason': err
                });
                return true;
            })
        })
        return true;
    } else {
        sendResponse({
            'status': false,
            'reason': 'Invalid type or type is not defined'
        });
        return true;
    }

});

chrome.alarms.onAlarm.addListener(function (e) {
    try {
        if (e.name == 'seriesStock_Refresh') {
            //console.log('seriesstock refresh')
            // ストレージ取得
            let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
            getStorageData.then(function (result) {
                // 有効でかつストック中がundefinedじゃない
                if (result.enableseriesstock && result.stockedseries) {
                    // lengthが300以下なら
                    if (result.stockedseries.length < 300) {
                        // forEachで一個ずつ処理
                        result.stockedseries.forEach((element, i) => {
                            setTimeout(() => {
                                //console.log(element.seriesID)
                                // キャッシュなしで取得(これでキャッシュされる)
                                if (element.seriesID) {
                                    getSeriesInfo(element.seriesID, 2)
                                }
                            }, i * 10000);
                            // i * 15000msで10sおきに実行
                        });
                    }
                }
            })
        } else if (e.name == 'nicoRepo_Refresh') {
            let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
            getStorageData.then(function (result) {
                // 有効であるか最近のニコレポタブが表示状態にある
                if (result.enablenicorepotab || (result.dashboardsortlist && result.dashboardsortlist.some(elem => elem.name == "nicorepo" && elem.isHidden == false ))) {
                }
            })
        }
    } catch (err) {
        console.error("Error in alarm refresh: " + err)
    }
})
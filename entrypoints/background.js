

export default defineBackground({
    persistent: false,
main(){
    const manifestData = browser.runtime.getManifest();
    browser.runtime.onInstalled.addListener(function (details) {
        if (details.reason == "install") {
            browser.tabs.create({
                url: browser.runtime.getURL("welcome.html")
            });
        } else if (details.reason == "update" && details.previousVersion !== manifestData.version) {
            if (browser.browserAction != undefined) {
                browser.browserAction.setBadgeText({ text: "▲" })
                browser.browserAction.setBadgeBackgroundColor({ color: "#169cf0"});
            } else if (browser.action != undefined) {
                browser.action.setBadgeText({ text: "▲" })
                browser.action.setBadgeBackgroundColor({ color: "#169cf0"});
            }
            if (
                details.previousVersion.split(".")[0] != manifestData.version.split(".")[0]
            ) {
                browser.tabs.create({
                    url: browser.runtime.getURL("update.html")
                });
            }
            browser.storage.local.set({ "versionupdated": true })
        }
        browser.contextMenus.create({
            id: "dicsearch",
            title: 'ニコニコ大百科で %s を検索',
            contexts: ["selection"],
            visible: false
        });
        browser.alarms.create('seriesStock_Refresh', { delayInMinutes: 1, periodInMinutes: 120 })
        //browser.alarms.create('dynamicPatch_Refresh', { delayInMinutes: 0, periodInMinutes: 360 })
        let getStorageData = browser.storage.sync.get(null)
        getStorageData.then((storage) => {
            if (storage.pediacontextsearch == true || storage.pediacontextsearch == false) {
                browser.contextMenus.update( "dicsearch", {visible: storage.pediacontextsearch});
            } else {
                browser.contextMenus.update( "dicsearch", {visible: false});
            }
        })
    });
    
    browser.contextMenus.onClicked.addListener(function (info, tab) {
        switch (info.menuItemId) {
            case "dicsearch":
                let dicsearchlink = 'https://dic.nicovideo.jp/s/al/t/' + info.selectionText
                browser.tabs.create({
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
                let getStorageData = browser.storage.local.get(null);
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
                                            browser.storage.local.set({ "seriesdatacache": { [seriesid]: dataobj } })
                                            resolve(dataobj)
                                        } else {
                                            // そうじゃなければ、ストレージの内容をvarにコピーして、変更したcacheを付け足して、ストレージに突っ込む
                                            const seriescache = {...storage.seriesdatacache, [seriesid]: dataobj};
                                            browser.storage.local.set({ "seriesdatacache": seriescache });
                                            if (cachemode == 2) {
                                                // キャッシュがundefinedじゃなくてシリーズIDのキャッシュも過去にされててdataが今持ってるものと違うなら+を表示
                                                if (storage.seriesdatacache != undefined && (storage.seriesdatacache[seriesid] != undefined && dataobj.data.totalCount != storage.seriesdatacache[seriesid].data.totalCount)) {
                                                    if (browser.browserAction != undefined) {
                                                        browser.browserAction.setBadgeText({ text: "S" })
                                                        browser.browserAction.setBadgeBackgroundColor({ color: "#1dab35"});
                                                    } else if (browser.action != undefined) {
                                                        browser.action.setBadgeText({ text: "S" })
                                                        browser.action.setBadgeBackgroundColor({ color: "#1dab35"});
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

    function getSeriesNameFromWatchPage() {
        const mintWatchSeriesAnchorElem = document.querySelector("a[data-pmw-type=\"series-title\"]")
        if (mintWatchSeriesAnchorElem && mintWatchSeriesAnchorElem.getAttribute("data-pmw-value")) {
            return { status: true, name: mintWatchSeriesAnchorElem.textContent, seriesId: mintWatchSeriesAnchorElem.getAttribute("data-pmw-value") }
        }
        const seriesAnchorElem = document.querySelector("a[data-anchor-page=\"watch\"][data-anchor-area=\"series\"]")
        console.log(seriesAnchorElem)
        if ( !seriesAnchorElem || !seriesAnchorElem.href || !seriesAnchorElem.pathname ) return {status: false}
        const splittedPathname = seriesAnchorElem.pathname.split("/")
        if ( splittedPathname.length < 2 ) return {status: false}
        return { status: true, name: seriesAnchorElem.textContent, seriesId: splittedPathname[2] }
    }
    
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type == "getRankingXml") {
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
        } else if (message.type == "openThisNCLink") {
            if (message.href != null || message.href != undefined) {
                try {
                    browser.tabs.query({ 'active': true, 'currentWindow': true }, tabarray => {
                        const activeURL = tabarray[0].url
                        if (activeURL != undefined && activeURL.indexOf('www.nicovideo.jp') != -1) {
                            browser.tabs.update(tabarray[0].id, { url: message.href })
                        } else {
                            browser.tabs.create({ url: message.href });
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
                    browser.tabs.create({ url: message.href });
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
            let getStorageData = browser.storage.sync.get(null);
            getStorageData.then((storage) => {
                if (storage.pediacontextsearch == true || storage.pediacontextsearch == false) {
                    browser.contextMenus.update( "dicsearch", {visible: storage.pediacontextsearch});
                } else {
                    browser.contextMenus.update( "dicsearch", {visible: false});
                }
                sendResponse({
                    'status': false,
                });
                return true;
            })
        } else if (message.type == "getActiveNCState") {
            if ( message.getType == "series" ) {
                try {
                    browser.tabs.query({ 'active': true, 'currentWindow': true }, tabarray => {
                        if ( tabarray && tabarray[0] ) {
                            const activeURL = tabarray[0].url
                            console.log(activeURL)
                            const pathArray = activeURL.replace(/\?.*$/, "").replace("https://www.nicovideo.jp/", "").split("/");
                            if (activeURL && activeURL.indexOf('www.nicovideo.jp') !== -1 ) {
                                if (pathArray.length >= 4 && pathArray[0] == "user" && pathArray[2] == "series") {
                                    new Promise((resolve) => chrome.scripting.executeScript({
                                        target: { tabId: tabarray[0].id },
                                        func: getSeriesNameFromPage,
                                        args: [pathArray[3],]
                                    }, resolve)).then(res => {
                                        if (!res[0]) return;
                                        const result = res[0].result
                                        if ( result && result.status == true && result.name ) {
                                            sendResponse({ 'status': true, 'seriesId': pathArray[3], 'name': result.name });
                                            return true;
                                        } else {
                                            sendResponse({ 'status': true, 'seriesId': pathArray[3] });
                                            return true;
                                        }
                                    })
                                } else if (pathArray.length >= 1 && pathArray[0] == "watch") {
                                    console.log("this is watchpage")
                                    new Promise((resolve) => chrome.scripting.executeScript({
                                        target: { tabId: tabarray[0].id },
                                        func: getSeriesNameFromWatchPage
                                    }, resolve)).then(res => {
                                        if (!res[0]) return;
                                        const result = res[0].result
                                        if ( result && result.status == true && result.name ) {
                                            sendResponse({ 'status': true, 'seriesId': result.seriesId, 'name': result.name });
                                            return true;
                                        } else {
                                            sendResponse({ 'status': false, 'reason': 'Cannot get series name from page.' });
                                            return true;
                                        }
                                    })
                                } else {
                                    console.log("failed")
                                    sendResponse({ 'status': false, 'reason': 'Current tab is not watchpage or not userpage.' });
                                    return true;
                                }
                            } else {
                                sendResponse({ 'status': false, 'reason': 'Current tab is not Nicovideo page.' });
                                return true;
                            }
                        } else {
                            sendResponse({ 'status': false, 'reason': 'Cannot get tab information.' });
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
            let getStorageData = browser.storage.sync.get(null)
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
                    //console.log(videoInfo)
                    // データと応答とシリーズ情報が存在する？
                    if ( videoInfo.data && videoInfo.data.response && videoInfo.data.response.series ) {
                        // シリーズ情報を代入して、ストック情報をコピー
                        const thisSeriesInfo = videoInfo.data.response.series
                        //console.log(thisSeriesInfo)
                        const stockedseriesarray = JSON.parse(JSON.stringify(storage.stockedseries))
                        // ストック情報を走査して、現在の動画が属しているシリーズに一致する要素を書き換える
                        stockedseriesarray.forEach((object) => {
                            // 型が違う！！===にしないように
                            if (object.seriesID == thisSeriesInfo.id) {
                                object.lastVidID = message.smId
                                object.lastVidName = videoInfo.data.response.video.title
                                if ( thisSeriesInfo.video.next ) {
                                    object.nextVidID = thisSeriesInfo.video.next.id
                                    object.nextVidName = thisSeriesInfo.video.next.title
                                } else {
                                    object.nextVidID = null
                                    object.nextVidName = null
                                }
    
                                //console.log(object)
                            }
                        })
                        // 保存してステータス返却
                        browser.storage.sync.set({
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
    
    browser.alarms.onAlarm.addListener(function (e) {
        try {
            if (e.name == 'seriesStock_Refresh') {
                //console.log('seriesstock refresh')
                // ストレージ取得
                let getStorageData = browser.storage.sync.get(null)
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
            }
        } catch (err) {
            console.error("Error in alarm refresh: " + err)
        }
    })
}
});

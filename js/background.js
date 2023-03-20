chrome.contextMenus.create({
    id: "dicsearch",
    title: 'ニコニコ大百科で %s を検索',
    contexts: ["selection"]
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

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("pages/welcome.html")
        });
    }
});
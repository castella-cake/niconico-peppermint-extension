let manifestData = chrome.runtime.getManifest();
$("#current-version").text ("v" + manifestData.version + " Manifest V" + manifestData.manifest_version)

// button がclickされたときに発火！！！！(前はsubmitだったけど必要ないと思ったのでclickへ)
function saveOptions() {
    console.log(`submit!`)
    // storageに変更を書き込む。
    chrome.storage.sync.set(
        {
            //"test_var": document.querySelector("#test-form-input").value,
            //"test_checkbox": document.querySelector("#checkbox-form-input").checked,
            // Hide
            "hiderankpagead": document.querySelector("#input-hiderankpagead").checked,
            "hideeventbanner": document.querySelector("#input-hideeventbanner").checked,
            "hidepopup": document.querySelector("#input-hidepopup").checked,
            // Player
            "playertheme": document.querySelector("#select-playertheme").value,
            "playerstyleoverride": document.querySelector("#select-playerstyleoverride").value,
            // Watchpage
            "replacemarqueetext": document.querySelector("#input-replacemarqueetext").checked,
            "highlightlockedtag": document.querySelector("#input-highlightlockedtag").checked,
            "watchpagetheme": document.querySelector("#select-watchpagetheme").value,
            "enablenicoboxui": document.querySelector("#input-enablenicoboxui").checked,
            "usenicoboxui": document.querySelector("#input-usenicoboxui").checked,
            // Other
            "alignpagewidth": document.querySelector("#input-alignpagewidth").checked,
            "highlightnewnotice": document.querySelector("#input-highlightnewnotice").checked,
            // Global
            "darkmode": document.querySelector("#select-darkmode").value,
            "headerbg": document.querySelector("#select-headerbg").value,
            "headercolor": document.querySelector("#input-headercolor").value,
            // Unstable
            "quickvidarticle": document.querySelector("#input-quickvidarticle").checked
        }
    );
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(restoreOptions, onError)
    console.log(`Saved!:`)
}


// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {
    function setCurrentChoice(result) {
        //document.querySelector("#test-form-input").value = result.test_var || "hello";
        //document.querySelector("#checkbox-form-input").checked = result.test_checkbox;
        // Hide
        document.querySelector("#input-hiderankpagead").checked = result.hiderankpagead;
        document.querySelector("#input-hideeventbanner").checked = result.hideeventbanner;
        document.querySelector("#input-hidepopup").checked = result.hidepopup;
        // Player
        document.querySelector("#select-playertheme").value = result.playertheme || "";
        // TODO: 後回しのためとりあえずDisableに戻す
        document.querySelector("#select-playerstyleoverride").value = "";
        // WatchPage
        document.querySelector("#input-replacemarqueetext").checked = result.replacemarqueetext;
        document.querySelector("#input-highlightlockedtag").checked = result.highlightlockedtag;
        document.querySelector("#select-watchpagetheme").value = result.watchpagetheme || "";
        document.querySelector("#input-enablenicoboxui").checked = result.enablenicoboxui;
        document.querySelector("#input-usenicoboxui").checked = result.usenicoboxui;
        // Other
        document.querySelector("#input-alignpagewidth").checked = result.alignpagewidth;
        document.querySelector("#input-highlightnewnotice").checked = result.highlightnewnotice;
        // Global
        document.querySelector("#select-darkmode").value = result.darkmode || "";
        document.querySelector("#select-headerbg").value = result.headerbg || "";
        document.querySelector("#input-headercolor").value = result.headercolor || "#252525";
        // Unstable
        document.querySelector("#input-quickvidarticle").checked = result.quickvidarticle;
        if ( result.headerbg != "custom" ) {
            $('#input-headercolor').prop('disabled', true);
        } else {
            $('#input-headercolor').prop('disabled', false);
        }
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}

$("#settings-form").change(saveOptions);

    document.addEventListener("DOMContentLoaded", restoreOptions);
    document.querySelector("#settings-form").addEventListener("click", saveOptions);
let manifestData = browser.runtime.getManifest();
$("#current-version").text ("v" + manifestData.version + " Manifest V" + manifestData.manifest_version)

// button "保存"(#submit)が押されたときに発火！！！！
function saveOptions(e) {
    e.preventDefault();
    // storageに変更を書き込む。
    browser.storage.sync.set(
        {
            "test_var": document.querySelector("#test-form-input").value,
            "test_checkbox": document.querySelector("#checkbox-form-input").checked,

            "hiderankpagead": document.querySelector("#input-hiderankpagead").checked,
            "hideeventbanner": document.querySelector("#input-hideeventbanner").checked,
            "hidepopup": document.querySelector("#input-hidepopup").checked,
            
            "playertheme": document.querySelector("#select-playertheme").value,
            "playerstyleoverride": document.querySelector("#select-playerstyleoverride").value,

            "replacemarqueetext": document.querySelector("#input-replacemarqueetext").checked,
            "alignpagewidth": document.querySelector("#input-alignpagewidth").checked,
            "darkmode": document.querySelector("#select-darkmode").value,
            "headerbg": document.querySelector("#select-headerbg").value,
            "headercolor": document.querySelector("#input-headercolor").value,
            "highlightlockedtag": document.querySelector("#input-highlightlockedtag").checked,
            "watchpagetheme": document.querySelector("#select-watchpagetheme").value,

            "enablenicoboxui": document.querySelector("#input-enablenicoboxui").checked,
            "usenicoboxui": document.querySelector("#input-usenicoboxui").checked
        }
    );
    location.reload();
    $(function(){
        console.log(`Reloaded!`)
        $("#save-state").html ("設定をセーブしました。<br>保存した設定を反映させるには、リロードする必要があります。")
    });
}

// Debug!!!!!!!
function onGot(item) {
    console.log(item);
}

// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#test-form-input").value = result.test_var || "hello";
        document.querySelector("#checkbox-form-input").checked = result.test_checkbox;
        document.querySelector("#input-hiderankpagead").checked = result.hiderankpagead;
        document.querySelector("#input-hideeventbanner").checked = result.hideeventbanner;
        document.querySelector("#input-hidepopup").checked = result.hidepopup;
        document.querySelector("#select-playertheme").value = result.playertheme || "";
        // TODO: 後回しのためとりあえずDisableに戻す
        document.querySelector("#select-playerstyleoverride").value = "";
        document.querySelector("#input-replacemarqueetext").checked = result.replacemarqueetext;
        document.querySelector("#input-alignpagewidth").checked = result.alignpagewidth;
        document.querySelector("#select-darkmode").value = result.darkmode || "";
        document.querySelector("#select-headerbg").value = result.headerbg || "";
        document.querySelector("#input-headercolor").value = result.headercolor || "#252525";
        document.querySelector("#input-highlightlockedtag").checked = result.highlightlockedtag;
        document.querySelector("#select-watchpagetheme").value = result.watchpagetheme || "";
        document.querySelector("#input-enablenicoboxui").checked = result.enablenicoboxui;
        document.querySelector("#input-usenicoboxui").checked = result.usenicoboxui;
        if (result.test_var == "hello") {
            $("#test-form-stat").text ("HELLO WORLD!!!!!!!!")
        } else {
            $("#test-form-stat").text (result.test_var)
        }
        $("#debug").text ()
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get(null);
    getting.then(setCurrentChoice, onError);
}

    document.addEventListener("DOMContentLoaded", restoreOptions);
    document.querySelector("#save-form").addEventListener("submit", saveOptions);

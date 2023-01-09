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
            "playertheme": document.querySelector("#select-playertheme").value
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
        document.querySelector("#select-playertheme").value = result.playertheme
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

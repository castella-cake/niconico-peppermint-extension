import $ from 'jquery'

// button がclickされたときに発火！！！！(前はsubmitだったけど必要ないと思ったのでclickへ)
function saveOptions() {
    //console.log(`submit!`)
    // storageに変更を書き込む。
    browser.storage.sync.set({customcolorpalette:
        {
            mainscheme: $("#select-mainscheme").val(),
            bgcolor1: $("#input-bgcolor1").val(),
            bgcolor2: $("#input-bgcolor2").val(),
            bgcolor3: $("#input-bgcolor3").val(),
            bgcolor4: $("#input-bgcolor4").val(),
            //bgcolorad: $("#input-bgcolorad").val(),
            //bgcoloraw: $("#input-bgcoloraw").val(),
            textcolor1: $("#input-textcolor1").val(),
            textcolor2: $("#input-textcolor2").val(),
            textcolor3: $("#input-textcolor3").val(),
            textcolor4: $("#input-textcolor4").val(),
            textcolornew: $("#input-textcolornew").val(),
            accent1: $("#input-accent1").val(),
            accent2: $("#input-accent2").val(),
            hover1: $("#input-hover1").val(),
            hover2: $("#input-hover2").val(),
            linktext1: $("#input-linktext1").val(),
            linktext2: $("#input-linktext2").val(),
            linktext3: $("#input-linktext3").val(),
            nicoru1: $("#input-nicoru1").val(),
            nicoru2: $("#input-nicoru2").val(),
            nicoru3: $("#input-nicoru3").val(),
            nicoru4: $("#input-nicoru4").val(),
            dangerous1: $("#input-dangerous1").val(),
            likecolor: $("#input-likecolor").val(),
            likebg: $("#input-likebg").val(),
        }
    });
    let getStorageData = browser.storage.sync.get(null);
    getStorageData.then(restoreOptions, onError)
    //console.log(`Saved!`)
}


// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {
    function setCurrentChoice(result) {
        if (result.customcolorpalette != undefined) {
            $("#select-mainscheme").val(result.customcolorpalette.mainscheme || "dark");
            $("#input-bgcolor1").val(result.customcolorpalette.bgcolor1 || "");
            $("#input-bgcolor2").val(result.customcolorpalette.bgcolor2 || "");
            $("#input-bgcolor3").val(result.customcolorpalette.bgcolor3 || "");
            $("#input-bgcolor4").val(result.customcolorpalette.bgcolor4 || "");
            //$("#input-bgcolorad").val(result.customcolorpalette.bgcolorad || "");
            //$("#input-bgcoloraw").val(result.customcolorpalette.bgcoloraw || "");
            $("#input-textcolor1").val(result.customcolorpalette.textcolor1 || "");
            $("#input-textcolor2").val(result.customcolorpalette.textcolor2 || "");
            $("#input-textcolor3").val(result.customcolorpalette.textcolor3 || "");
            $("#input-textcolor4").val(result.customcolorpalette.textcolor4 || "");
            $("#input-textcolornew").val(result.customcolorpalette.textcolornew || "");
            $("#input-accent1").val(result.customcolorpalette.accent1 || "");
            $("#input-accent2").val(result.customcolorpalette.accent2 || "");
            $("#input-hover1").val(result.customcolorpalette.hover1 || "");
            $("#input-hover2").val(result.customcolorpalette.hover2 || "");
            $("#input-linktext1").val(result.customcolorpalette.linktext1 || "");
            $("#input-linktext2").val(result.customcolorpalette.linktext2 || "");
            $("#input-linktext3").val(result.customcolorpalette.linktext3 || "");
            $("#input-nicoru1").val(result.customcolorpalette.nicoru1 || "");
            $("#input-nicoru2").val(result.customcolorpalette.nicoru2 || "");
            $("#input-nicoru3").val(result.customcolorpalette.nicoru3 || "");
            $("#input-nicoru4").val(result.customcolorpalette.nicoru4 || "");
            $("#input-dangerous1").val(result.customcolorpalette.dangerous1 || "");
            $("#input-likecolor").val(result.customcolorpalette.likecolor || "");
            $("#input-likebg").val(result.customcolorpalette.likebg || "");
        }
    }
    let getStorageData = browser.storage.sync.get(null);
    getStorageData.then(setCurrentChoice, onError)
}

$("#settings-form").on('change', saveOptions);

$("#reset").on('click',function() {
    browser.storage.sync.set({
        "customcolorpalette": {
            "mainscheme": "dark",
            "bgcolor1": "#252525",
            "bgcolor2": "#333",
            "bgcolor3": "#666",
            "bgcolor4": "#aaa",
            "bgcolorad": "#0005",
            "bgcoloraw": "#fff5",
            "textcolor1": "#fff",
            "textcolor2": "#ddd",
            "textcolor3": "#aaa",
            "textcolornew": "#e05050",
            "accent1": "#444",
            "accent2": "#888",
            "hover1": "#666",
            "hover2": "#aaa",
            "linktext1": "#8fb9df",
            "linktext2": "#8ed9ff",
            "linktext3": "#008acf",
            "nicoru1": "rgba(201, 168, 62, 0.1)",
            "nicoru2": "rgba(201, 168, 62, 0.2)",
            "nicoru3": "rgba(201, 168, 62, 0.35)",
            "nicoru4": "rgba(201, 168, 62, 0.5)",
            "dangerous1": "rgb(245, 71, 71)"
        }
    })
    location.reload()
});

document.addEventListener("DOMContentLoaded", restoreOptions);
//document.querySelector("#settings-form").addEventListener("click", saveOptions);
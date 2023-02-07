let manifestData = chrome.runtime.getManifest();
$("#current-version").text ("v" + manifestData.version_name + " MV" + manifestData.manifest_version)

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    $('body').css({
        'color':'#fff',
        'background-color':'#252525'
    })
}

// button がclickされたときに発火！！！！(前はsubmitだったけど必要ないと思ったのでclickへ)
function saveOptions() {
    console.log(`submit!`)
    // storageに変更を書き込む。
    console.log($("#input-alignpagewidth").prop('checked'))
    chrome.storage.sync.set(
        {
            //"test_var": $("#test-form-input").val,
            //"test_checkbox": $("#checkbox-form-input").prop('checked'),
            // Hide
            "hiderankpagead": $("#input-hiderankpagead").prop('checked'),
            "hideeventbanner": $("#input-hideeventbanner").prop('checked'),
            "hidepopup": $("#input-hidepopup").prop('checked'),
            //"hidevidtopad": $("#input-hidevidtopad").prop('checked'),
            // Player
            "playertheme": $("#select-playertheme").val(),
            //"playerstyleoverride": $("#select-playerstyleoverride").val(),
            // Watchpage
            "replacemarqueetext": $("#input-replacemarqueetext").prop('checked'),
            "highlightlockedtag": $("#input-highlightlockedtag").prop('checked'),
            "watchpagetheme": $("#select-watchpagetheme").val(),
            "usetheaterui": $("#input-usetheaterui").prop('checked'),
            "enablenicoboxui": $("#input-enablenicoboxui").prop('checked'),
            "usenicoboxui": $("#input-usenicoboxui").prop('checked'),
            "enabledlbutton": $("#input-enabledlbutton").prop('checked'),
            // NicoPedia
            "hidereputation": $("#select-hidereputation").val(),
            "liketonicoru": $('#input-liketonicoru').prop('checked'),
            "dicfullwidth": $("#input-dicfullwidth").prop('checked'),
            "dicforcewidthmode": $("#select-dicforcewidthmode").val(),
            "sidebartoleft": $("#input-sidebartoleft").prop('checked'),
            "dicbettereditor": $("#input-dicbettereditor").prop('checked'),
            // Other
            "alignpagewidth": $("#input-alignpagewidth").prop('checked'),
            "highlightnewnotice": $("#input-highlightnewnotice").prop('checked'),
            "vidtoptwocolumn": $('#input-vidtoptwocolumn').prop('checked'),
            // Global
            "darkmode": $("#select-darkmode").val(),
            "headerbg": $("#select-headerbg").val(),
            "headercolor": $("#input-headercolor").val(),
            "enablevisualpatch": $("#input-enablevisualpatch").prop('checked'),
            "enablespredirect": $("#input-enablespredirect").prop('checked'),
            //"enablefocusheader": $("#input-enablefocusheader").prop('checked'),
            "enableseriesstock": $("#input-enableseriesstock").prop('checked'),
            "enablecustomvideotop": $("#input-enablecustomvideotop").prop('checked'),
            // Unstable
            "quickvidarticle": $("#input-quickvidarticle").prop('checked')
        }
    );
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(restoreOptions, onError)
    console.log(`Saved!`)
}


// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {
    function setCurrentChoice(result) {
        //$("#test-form-input").val = result.test_var || "hello";
        //$("#checkbox-form-input").prop('checked',result.test_checkbox;
        // Hide
        $("#input-hiderankpagead").prop('checked',result.hiderankpagead);
        $("#input-hideeventbanner").prop('checked',result.hideeventbanner);
        $("#input-hidepopup").prop('checked',result.hidepopup);
        //$("#input-hidevidtopad").prop('checked',result.hidevidtopad);
        // Player
        $("#select-playertheme").val(result.playertheme || "");
        // TODO: 後回しのためとりあえずDisableに戻す
        //$("#select-playerstyleoverride").val("");
        // WatchPage
        $("#input-replacemarqueetext").prop('checked',result.replacemarqueetext);
        $("#input-highlightlockedtag").prop('checked',result.highlightlockedtag);
        $("#select-watchpagetheme").val(result.watchpagetheme || "");
        $("#input-usetheaterui").prop('checked',result.usetheaterui);
        $("#input-enablenicoboxui").prop('checked',result.enablenicoboxui);
        $("#input-usenicoboxui").prop('checked',result.usenicoboxui);
        $("#input-enabledlbutton").prop('checked',result.enabledlbutton);
        // NicoPedia
        $("#select-hidereputation").val(result.hidereputation || "");
        $('#input-liketonicoru').prop('checked',result.liketonicoru)
        $("#input-dicfullwidth").prop('checked',result.dicfullwidth);
        $("#select-dicforcewidthmode").val(result.dicforcewidthmode || "");
        $("#input-sidebartoleft").prop('checked',result.sidebartoleft);
        $("#input-dicbettereditor").prop('checked',result.dicbettereditor);
        // Other
        $("#input-alignpagewidth").prop('checked',result.alignpagewidth);
        $("#input-highlightnewnotice").prop('checked',result.highlightnewnotice);
        $("#input-vidtoptwocolumn").prop('checked',result.vidtoptwocolumn);
        // Global
        $("#select-darkmode").val(result.darkmode || "");
        $("#select-headerbg").val(result.headerbg || "");
        $("#input-headercolor").val(result.headercolor || "#252525");
        $("#input-enablevisualpatch").prop('checked',result.enablevisualpatch)
        $("#input-enablespredirect").prop('checked',result.enablespredirect)
        //$("#input-enablefocusheader").prop('checked',result.enablefocusheader)
        $("#input-enableseriesstock").prop('checked',result.enableseriesstock)
        $("#input-enablecustomvideotop").prop('checked',result.enablecustomvideotop)
        // Unstable
        $("#input-quickvidarticle").prop('checked',result.quickvidarticle);
        if ( result.headerbg != "custom" ) {
            $('#input-headercolor').prop('disabled', true);
        } else {
            $('#input-headercolor').prop('disabled', false);
        }
        if ( result.dicfullwidth != true) {
            $('#input-dicforcefullwidth').prop('disabled', true);
        } else {
            $('#input-dicforcefullwidth').prop('disabled', false);
        }
        console.log(result.alignpagewidth)
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}

$("#settings-form").on('change',saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
//document.querySelector("#settings-form").addEventListener("click", saveOptions);
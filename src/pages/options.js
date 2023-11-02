let manifestData = chrome.runtime.getManifest();
$("#current-version").text("v" + manifestData.version_name + " MV" + manifestData.manifest_version)

$('a').on('click', function (e) {
    if ($(this).attr('target') != "_blank") {
        e.preventDefault();
        $('body').css({
            'animation': 'fadeout 0.1s ease forwards 0s',
        })
        let href = $(this).attr('href')
        setTimeout(function () {
            location.href = href
        }, 100)
    }
})

function saveOptions() {
    //console.log(`submit!`)
    // storageに変更を書き込む。
    //console.log($("#input-alignpagewidth").prop('checked'))
    chrome.storage.sync.set(
        {
            //"test_var": $("#test-form-input").val,
            //"test_checkbox": $("#checkbox-form-input").prop('checked'),
            // Hide
            "hiderankpagead": $("#input-hiderankpagead").prop('checked'),
            "hideeventbanner": $("#input-hideeventbanner").prop('checked'),
            "hidepopup": $("#input-hidepopup").prop('checked'),
            "hidemetadata": $("#select-hidemetadata").val(),
            // Player
            "playertheme": $("#select-playertheme").val(),
            "playerstyleoverride": $("#select-playerstyleoverride").val(),
            // Watchpage
            //"replacemarqueetext": $("#input-replacemarqueetext").prop('checked'),
            "replacemarqueecontent": $("#select-replacemarqueecontent").val(),
            "commentrow": $("#input-commentrow").val(),
            "cleanvidowner": $("#input-cleanvidowner").prop('checked'),
            "highlightlockedtag": $("#input-highlightlockedtag").prop('checked'),
            "watchpagetheme": $("#select-watchpagetheme").val(),
            "shortcutassist": $("#input-shortcutassist").prop('checked'),
            "excommander": $("#input-excommander").prop('checked'),
            "usetheaterui": $("#input-usetheaterui").prop('checked'),
            //"theateruialwaysdark": $("#input-theateruialwaysdark").prop('checked'),
            "enablenicoboxui": $("#input-enablenicoboxui").prop('checked'),
            "usenicoboxui": $("#input-usenicoboxui").prop('checked'),
            "useoldnicoboxstyle": $("#input-useoldnicoboxstyle").prop('checked'),
            "enabledlbutton": $("#input-enabledlbutton").prop('checked'),
            "hidesupporterbutton": $("#select-hidesupporterbutton").val(),
            "enablemisskeyshare": $("#input-enablemisskeyshare").prop('checked'),
            // NicoPedia
            "hidereputation": $("#select-hidereputation").val(),
            "liketonicoru": $('#input-liketonicoru').prop('checked'),
            "dicfullwidth": $("#input-dicfullwidth").prop('checked'),
            "dicforcewidthmode": $("#select-dicforcewidthmode").val(),
            "sidebartoleft": $("#input-sidebartoleft").prop('checked'),
            "dicbettereditor": $("#input-dicbettereditor").prop('checked'),
            "pediacontextsearch": $("#input-pediacontextsearch").prop('checked'),
            // Other
            "alignpagewidth": $("#input-alignpagewidth").prop('checked'),
            "fixedheaderwidth": $("#input-fixedheaderwidth").prop('checked'),
            "highlightnewnotice": $("#input-highlightnewnotice").prop('checked'),
            "vidtoptwocolumn": $('#input-vidtoptwocolumn').prop('checked'),
            // Global
            "darkmode": $("#select-darkmode").val(),
            "darkmodedynamic": $("#input-darkmodedynamic").prop('checked'),
            "headerbg": $("#select-headerbg").val(),
            "headercolor": $("#input-headercolor").val(),
            "enablevisualpatch": $("#input-enablevisualpatch").prop('checked'),
            "enablespredirect": $("#input-enablespredirect").prop('checked'),
            //"enablefocusheader": $("#input-enablefocusheader").prop('checked'),
            "enableseriesstock": $("#input-enableseriesstock").prop('checked'),
            "showseriesstockinpage": $("#input-showseriesstockinpage").prop('checked'),
            "enablecustomvideotop": $("#input-enablecustomvideotop").prop('checked'),
            "enablenicorepotab": $("#input-enablenicorepotab").prop('checked'),
            // Unstable
            "quickvidarticle": $("#input-quickvidarticle").prop('checked')
        }
    );
    chrome.runtime.sendMessage({ "type": "updateContextMenuState" })
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
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
        //$("#test-form-input").val = result.test_var || "hello";
        //$("#checkbox-form-input").prop('checked',result.test_checkbox;
        // Hide
        $("#input-hiderankpagead").prop('checked', result.hiderankpagead);
        $("#input-hideeventbanner").prop('checked', result.hideeventbanner);
        $("#input-hidepopup").prop('checked', result.hidepopup);
        $("#select-hidesupporterbutton").val(result.hidesupporterbutton || "");
        $("#select-hidemetadata").val(result.hidemetadata || "");
        // Player
        $("#select-playertheme").val(result.playertheme || "");
        // TODO: 後回しのためとりあえずDisableに戻す
        $("#select-playerstyleoverride").val(result.playerstyleoverride || "");
        // WatchPage
        //$("#input-replacemarqueetext").prop('checked', result.replacemarqueetext);
        $("#select-replacemarqueecontent").val(result.replacemarqueecontent || "");
        $("#input-highlightlockedtag").prop('checked', result.highlightlockedtag);
        $("#input-cleanvidowner").prop('checked', result.cleanvidowner);
        $("#input-commentrow").val(result.commentrow || 1);
        $("#select-watchpagetheme").val(result.watchpagetheme || "");
        $("#input-shortcutassist").prop('checked', result.shortcutassist);
        $("#input-excommander").prop('checked', result.excommander);
        $("#input-usetheaterui").prop('checked', result.usetheaterui);
        //$("#input-theateruialwaysdark").prop('checked', result.theateruialwaysdark);
        $("#input-enablenicoboxui").prop('checked', result.enablenicoboxui);
        $("#input-useoldnicoboxstyle").prop('checked', result.useoldnicoboxstyle);
        $("#input-usenicoboxui").prop('checked', result.usenicoboxui);
        $("#input-enabledlbutton").prop('checked', result.enabledlbutton);
        $("#input-enablemisskeyshare").prop('checked', result.enablemisskeyshare);
        // NicoPedia
        $("#select-hidereputation").val(result.hidereputation || "");
        $('#input-liketonicoru').prop('checked', result.liketonicoru)
        $("#input-dicfullwidth").prop('checked', result.dicfullwidth);
        $("#select-dicforcewidthmode").val(result.dicforcewidthmode || "");
        $("#input-sidebartoleft").prop('checked', result.sidebartoleft);
        $("#input-dicbettereditor").prop('checked', result.dicbettereditor);
        $("#input-pediacontextsearch").prop('checked', result.pediacontextsearch);
        // Other
        $("#input-alignpagewidth").prop('checked', result.alignpagewidth);
        $("#input-fixedheaderwidth").prop('checked', result.fixedheaderwidth);
        $("#input-highlightnewnotice").prop('checked', result.highlightnewnotice);
        $("#input-vidtoptwocolumn").prop('checked', result.vidtoptwocolumn);
        // Global
        $("#select-darkmode").val(result.darkmode || "");
        $("#input-darkmodedynamic").prop('checked', result.darkmodedynamic)
        $("#select-headerbg").val(result.headerbg || "");
        $("#input-headercolor").val(result.headercolor || "#252525");
        $("#input-enablevisualpatch").prop('checked', result.enablevisualpatch)
        $("#input-enablespredirect").prop('checked', result.enablespredirect)
        //$("#input-enablefocusheader").prop('checked',result.enablefocusheader)
        $("#input-enableseriesstock").prop('checked', result.enableseriesstock)
        $("#input-showseriesstockinpage").prop('checked', result.showseriesstockinpage)
        $("#input-enablecustomvideotop").prop('checked', result.enablecustomvideotop)
        $("#input-enablenicorepotab").prop('checked', result.enablenicorepotab)
        // Unstable
        $("#input-quickvidarticle").prop('checked', result.quickvidarticle);
        if (result.headerbg != "custom") {
            $('#input-headercolor').prop('disabled', true);
        } else {
            $('#input-headercolor').prop('disabled', false);
        }
        if (result.dicfullwidth != true) {
            $('#input-dicforcefullwidth').prop('disabled', true);
        } else {
            $('#input-dicforcefullwidth').prop('disabled', false);
        }
        //console.log(result.alignpagewidth)
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}
    let flavortext = ['PepperMint+の開発コードネームは"Mentha"でした。<br>計画されていた製品名は「PepperMintEx」でしたが、これはExtensionのExと混同される可能性があるため中止されました。','設定ページやクイックパネルでは、上の"PepperMint+の設定"や"PepperMint+"と書かれているタイトルをクリックすることで新しいタブで設定ページを開けることを知っていましたか？','カラーパレット"CyberNight"は、カスタムカラーパレットの開発中に生まれたものでした。今でもデバッグ用途として使用され続けています。','Niconico-PepperMintは、元々はランキングページのニコニ広告を非表示にする"HideNiconiAd"と"NicoPlayer-Gradient"を一つにまとめたものでした。','PepperMintはミントやハッカを指します。ハッカ油との繋がりや、<br>「クールにする」という意味合いをもって、このプロジェクトには「Niconico-PepperMint」という名称が付けられました。']
    document.getElementById('flavortext').innerHTML = flavortext[Math.floor(Math.random() * (flavortext.length))]

$("#settings-form").on('change', saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
//document.querySelector("#settings-form").addEventListener("click", saveOptions);
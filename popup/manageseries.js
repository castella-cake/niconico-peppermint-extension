if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    $('body').css({
        'color':'#fff',
        'background-color':'#252525'
    })
}

function appendTableRow(seriesid, seriesname) {
    var addTable = '<tr><td><input type="checkbox" id="input-tablecheck"></td><td id="tableid">' + seriesid + '</td><td id="tablename">' + seriesname + '</td><td><td><button id="remove" type="button">削除</button></td></td></tr>'
    console.log(`added series: ${addTable}`)
    $('#serieslist tbody').append(addTable);
}
function saveOptions() {
    // 配列を作る
    var seriesArray = [];

    // tr(行)をeachで一個づつ処理する
    $('table tr').each(function(i, elem){
        // idとnameが""じゃないならthじゃないと判断する
        if ( $(elem).children('#tableid').text() != "" && $(elem).children('#tablename').text() != "" ) {
            // 配列にオブジェクトを突っ込む
            seriesArray.push( { seriesID : $(elem).children('#tableid').text(), seriesName : $(elem).children('#tablename').text() } );
        }
    });
    console.log(seriesArray)
    // ストレージに突っ込む
    chrome.storage.sync.set({
        "stockedseries": seriesArray
    })
}

// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {
    function setCurrentChoice(result) {
        // ストレージからオブジェクト入り配列を引っ張ってきてeachで一個ずつ処理する
        $.each(result.stockedseries, function(i,object) {
            console.log(object)
            appendTableRow(object.seriesID, object.seriesName)
        })
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}

// 追加が押された時
$("#addseries").on('click',function() {
    appendTableRow($('#input-addseriesid').val(), $('#input-addseriesname').val());
    saveOptions();
});

// 削除が押された時
$('#serieslist').on('click', '#remove', function() {
    $(this).parents('tr').remove();
    saveOptions();
});

// 選択中のシリーズを削除が押された時
$("#removeselectedseries").on('click',function() {
    $('table #input-tablecheck').each(function(i, elem){
        if ( $(elem).prop('checked') ) {
            $(elem).parents('tr').remove();
        }
    });
    saveOptions();
})

// 保存が押された時
$("#save").on('click',saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
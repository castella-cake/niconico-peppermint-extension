$('a').on('click', function(e) {
    e.preventDefault();
    $('body').css({
        'animation': 'fadeout 0.1s ease forwards 0s',
    })
    let href = $(this).attr('href')
    setTimeout(function() {
        location.href = href
    }, 100)
})

function appendTableRow(obj) {
    let id = obj.seriesID
    let name = obj.seriesName
    let lastid = obj.lastVidID || ''
    let lastname = obj.lastVidName || ''
    let nextid = obj.nextVidID || ''
    let nextname = obj.nextVidName || ''
    let addTable = `<tr>
        <td><input type="checkbox" id="input-tablecheck"></td>
        <td id="tableid">${id}</td>
        <td id="tablename">${name}</td>
        <td id="tablelastid">${lastid}</td>
        <td id="tablelastname">${lastname}</td>
        <td id="tablenextid">${nextid}</td>
        <td id="tablenextname">${nextname}</td>
        <td><button id="remove" type="button">×</button></td>
    </tr>`
    let tableelem = document.createElement('tr')

    function addTDtoElem(id,text,elem) {
        let td = document.createElement('td')
        td.textContent = text
        td.id = id
        elem.appendChild(td)
    }
    let checktd = document.createElement('td')
    let checkbox = document.createElement('input')
    checkbox.id = 'input-tablecheck'
    checkbox.setAttribute('type','checkbox')
    checktd.appendChild(checkbox)
    tableelem.appendChild(checktd)
    addTDtoElem('tableid',obj.seriesID,tableelem)
    addTDtoElem('tablename',obj.seriesName || '名称未設定',tableelem)
    addTDtoElem('tablelastid',obj.lastVidID || '',tableelem)
    addTDtoElem('tablelastname',obj.lastVidName,tableelem)
    addTDtoElem('tablenextid',obj.nextVidID,tableelem)
    addTDtoElem('tablenextname',obj.nextVidName,tableelem)
    let removetd = document.createElement('td')
    let removebtn = document.createElement('button')
    removebtn.id = 'remove'
    removebtn.setAttribute('type','button')
    removebtn.textContent = '×'
    removetd.appendChild(removebtn)
    tableelem.appendChild(removetd)
    document.querySelector('#serieslist tbody').appendChild(tableelem)
}
function saveOptions() {
    // 配列を作る
    var seriesArray = [];

    // tr(行)をeachで一個づつ処理する
    $('#serieslist tr').each(function(i, elem){
        // idとnameが""じゃないならthじゃないと判断する
        if ( $(elem).children('#tableid').text() != "" && $(elem).children('#tablename').text() != "" ) {
            // create obj
            let seriesobj = {
                seriesID : $(elem).children('#tableid').text(), 
                seriesName : $(elem).children('#tablename').text(),
                lastVidID : $(elem).children('#tablelastid').text(),
                lastVidName : $(elem).children('#tablelastname').text(),
                nextVidID : $(elem).children('#tablenextid').text(),
                nextVidName : $(elem).children('#tablenextname').text(),
            }
            // remove empty key
            for(let key in seriesobj) {
                if (seriesobj[key] === "") {
                    delete seriesobj[key]
                }
            }
            // 配列にオブジェクトを突っ込む
            seriesArray.push(seriesobj);
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
            appendTableRow(object)
        })
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}

// 追加が押された時
$("#addseries").on('click',function() {
    let seriesobj = { seriesID: $('#input-addseriesid').val(), seriesName: $('#input-addseriesname').val()}
    appendTableRow(seriesobj);
    saveOptions();
});

// 削除が押された時
$('#serieslist').on('click', '#remove', function() {
    $(this).parents('tr').remove();
    saveOptions();
});

// 選択中のシリーズを削除が押された時
$("#removeselectedseries").on('click',function() {
    $('#serieslist #input-tablecheck').each(function(i, elem){
        if ( $(elem).prop('checked') == true ) {
            $(elem).parents('tr').remove();
        }
    });
    saveOptions();
})

$("#serieslist tbody").sortable({
    "axis": "y",
    "update": function(event,ui) {
        saveOptions();
    },
})

// 保存が押された時
$("#save").on('click',saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
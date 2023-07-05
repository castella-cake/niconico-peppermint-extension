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

    addTDtoElem('tabledomain',obj.domain,tableelem)
    let removetd = document.createElement('td')
    let removebtn = document.createElement('button')
    removebtn.id = 'remove'
    removebtn.setAttribute('type','button')
    removebtn.textContent = '×'
    removetd.appendChild(removebtn)
    tableelem.appendChild(removetd)
    document.querySelector('#instancelist tbody').appendChild(tableelem)
}
function saveOptions() {
    // 配列を作る
    var instanceArray = [];

    // tr(行)をeachで一個づつ処理する
    $('#instancelist tr').each(function(i, elem){
        // idとnameが""じゃないならthじゃないと判断する
        if ( $(elem).children('#tabledomain').text() != "") {
            // create obj
            let instanceobj = {
                "domain" : $(elem).children('#tabledomain').text()
            }
            // remove empty key
            for(let key in instanceobj) {
                if (instanceobj[key] === "") {
                    delete instanceobj[key]
                }
            }
            // 配列にオブジェクトを突っ込む
            instanceArray.push(instanceobj);
        }
    });
    //console.log(instanceArray)
    // ストレージに突っ込む
    chrome.storage.sync.set({
        "shareinstancelist": instanceArray
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
        $.each(result.shareinstancelist, function(i,object) {
            //console.log(object)
            appendTableRow(object)
        })
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}

// 追加が押された時
$("#addinstance").on('click',function() {
    let instanceobj = { "domain": $('#input-addinstancedomain').val() }
    appendTableRow(instanceobj);
    saveOptions();
});

// 削除が押された時
$('#instancelist').on('click', '#remove', function() {
    $(this).parents('tr').remove();
    saveOptions();
});

// 選択中のシリーズを削除が押された時
$("#removeselectedinstance").on('click',function() {
    $('#instancelist #input-tablecheck').each(function(i, elem){
        if ( $(elem).prop('checked') == true ) {
            $(elem).parents('tr').remove();
        }
    });
    saveOptions();
})

$("#instancelist tbody").sortable({
    "axis": "y",
    "update": function(event,ui) {
        saveOptions();
    },
})

// 保存が押された時
$("#save").on('click',saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
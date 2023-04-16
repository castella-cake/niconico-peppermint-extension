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

console.log('hello!')

function appendTableRow(dispstat, contentname, contentclass) {
    /*if (dispstat == true) { 
        var addTable = `<tr><td><input type="checkbox" id="disp" checked></td><td id="contentname">${contentname}</td><td id="contentclass">${contentclass}</td><td><button id="up" type="button">↑</button></td><td><button id="down" type="button">↓</button></td></tr>`
    } else {
        var addTable = `<tr><td><input type="checkbox" id="disp"></td><td id="contentname">${contentname}</td><td id="contentclass">${contentclass}</td><td><button id="up" type="button">↑</button></td><td><button id="down" type="button">↓</button></td></tr>`
    }
        console.log(`added row: ${addTable}`)
    $('#videotopcontentlist tbody').append(addTable);*/
    let tableelem = document.createElement('tr')
    function addTDtoElem(id,text,elem) {
        let td = document.createElement('td')
        td.textContent = text
        td.id = id
        elem.appendChild(td)
    }
    let checktd = document.createElement('td')
    let checkbox = document.createElement('input')
    checkbox.id = 'disp'
    checkbox.setAttribute('type','checkbox')
    if (dispstat == true) { 
        checkbox.setAttribute('checked', true)
    }
    checktd.appendChild(checkbox)
    tableelem.appendChild(checktd)
    addTDtoElem('contentname',contentname,tableelem)
    addTDtoElem('contentclass',contentclass,tableelem)
    let uptd = document.createElement('td')
    let upbtn = document.createElement('button')
    upbtn.id = 'up'
    upbtn.setAttribute('type','button')
    upbtn.textContent = '↑'
    uptd.appendChild(upbtn)
    tableelem.appendChild(uptd)

    let downtd = document.createElement('td')
    let downbtn = document.createElement('button')
    downbtn.id = 'down'
    downbtn.setAttribute('type','button')
    downbtn.textContent = '↓'
    downtd.appendChild(downbtn)
    tableelem.appendChild(downtd)
    document.querySelector('#videotopcontentlist tbody').appendChild(tableelem)
}
function saveOptions() {
    console.log('save!!!')
    // 配列を作る
    var VideoTopArray = [];

    // tr(行)をeachで一個づつ処理する
    $('table tr').each(function(i, elem){
        // idとnameが""じゃないならthじゃないと判断する
        if ( $(elem).children('#contentname').text() != "" && $(elem).children('#contentclass').text() != "" ) {
            // 配列にオブジェクトを突っ込む
            VideoTopArray.push( { dispstat : $(elem).children('td:first-child').children('input').prop('checked'), dispname : $(elem).children('#contentname').text(), classname : $(elem).children('#contentclass').text() } );
        }
    });
    console.log(VideoTopArray)
    // ストレージに突っ込む
    chrome.storage.sync.set({
        "customvideotop": VideoTopArray
    })
}

// エラー！！！！！
function onError(error) {
    console.log(`Error: ${error}`);
}

// ストレージからHTMLに戻す！！！
function restoreOptions() {
    function setCurrentChoice(result) {
        let VideoTopArray = [];
        if ( result.customvideotop == undefined || result.customvideotop == null || result.customvideotop == [] || result.customvideotop == "" ) {
            VideoTopArray = [{ dispstat: true, dispname: "いきなり！動画紹介", classname: "VideoIntroductionAreaContainer" },{ dispstat: true, dispname: "おすすめの動画", classname: "RecommendAreaContainer" },{ dispstat: true, dispname: "視聴履歴", classname: "ViewHistoriesContainer" },{ dispstat: true, dispname: "その他のおすすめ", classname: "TagPushVideosContainer" },{ dispstat: true, dispname: "急上昇中のタグ", classname: "HotTagsContainer" },{ dispstat: true, dispname: "ランキング", classname: "RankingVideosContainer" },{ dispstat: true, dispname: "フォロー中の新着動画", classname: "FollowingVideosContainer" },{ dispstat: true, dispname: "TV放送中のアニメ", classname: "OnTvAnimeVideosContainer" },{ dispstat: true, dispname: "ニコニ広告", classname: "NicoadVideosContainer" },{ dispstat: true, dispname: "新着動画", classname: "NewArrivalVideosContainer" },{ dispstat: true, dispname: "お知らせ", classname: "NewsNotificationContainer"}]
        } else {
            VideoTopArray = result.customvideotop
        }
        console.log(result.customvideotop)
        // ストレージからオブジェクト入り配列を引っ張ってきてeachで一個ずつ処理する
        $.each(VideoTopArray, function(i,object) {
            console.log(object)
            appendTableRow(object.dispstat, object.dispname, object.classname)
        })
    }
    let getStorageData = new Promise((resolve) => chrome.storage.sync.get(null, resolve));
    getStorageData.then(setCurrentChoice, onError)
}


$('#videotopcontentlist').on('click', '#up', function() {
    //一番最初の要素ではupは使えないようにする
    console.log(`never gonna give you up! ${$(this).parents('tr').index()}`)
    if ($(this).parents('tr').index() > 0) {
        $(this).parents('tr').after($(this).parents('tr').prev('tr'))
    }
    saveOptions();
});
$('#videotopcontentlist').on('click', '#down', function() {
    //一番最初の要素ではupは使えないようにする
    console.log(`never gonna let you down! ${$(this).parents('tr').index()} ${$(this).parents('tr').next('tr').html()}`)
    if ($(this).parents('tr').next('tr').html() != undefined) {
        $(this).parents('tr').before($(this).parents('tr').next('tr'))
    }
    saveOptions();
});
$('#videotopcontentlist').on('change','#disp', saveOptions)

// 保存が押された時
$("#save").on('click',saveOptions);
$("#reset").on('click',function() {
    VideoTopArray = [{ dispstat: true, dispname: "いきなり！動画紹介", classname: "VideoIntroductionAreaContainer" },{ dispstat: true, dispname: "おすすめの動画", classname: "RecommendAreaContainer" },{ dispstat: true, dispname: "視聴履歴", classname: "ViewHistoriesContainer" },{ dispstat: true, dispname: "その他のおすすめ", classname: "TagPushVideosContainer" },{ dispstat: true, dispname: "急上昇中のタグ", classname: "HotTagsContainer" },{ dispstat: true, dispname: "ランキング", classname: "RankingVideosContainer" },{ dispstat: true, dispname: "フォロー中の新着動画", classname: "FollowingVideosContainer" },{ dispstat: true, dispname: "TV放送中のアニメ", classname: "OnTvAnimeVideosContainer" },{ dispstat: true, dispname: "ニコニ広告", classname: "NicoadVideosContainer" },{ dispstat: true, dispname: "新着動画", classname: "NewArrivalVideosContainer" },{ dispstat: true, dispname: "お知らせ", classname: "NewsNotificationContainer"}]
    chrome.storage.sync.set({
        "customvideotop": VideoTopArray
    })
    location.reload()
});

$("#videotopcontentlist tbody").sortable({
    "axis": "y",
    "update": function(event,ui) {
        saveOptions();
    },
})

document.addEventListener("DOMContentLoaded", restoreOptions);
// scriptタグ経由で注入される""ページスクリプト""。chromeなどは使えないことに注意。
import Hls from "hls.js"

function returnGreatestQuality(array) {
    for (const elem of array) {
        if (elem.isAvailable) return elem;
    }
    return false
}

async function getHls(videoId, body, actionTrackId, accessRightKey) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/watch/${encodeURIComponent(videoId)}/access-rights/hls?actionTrackId=${encodeURIComponent(actionTrackId)}`, {
        "headers": {
            "content-type": "application/json",
            "x-access-right-key": accessRightKey,
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp",
            "x-request-with": "nicovideo"
        },
        "referrer": "https://www.nicovideo.jp/",
        "body": body,
        "method": "POST",
        "credentials": "include"
    });
    const responseJson = await response.json()
    return responseJson
}

// ActionTrackIdで各レンダーを識別する
let previousATI = ""
document.addEventListener("pmw_informationReady", (e) => {
    // CORS関係でオブジェクトはStringになって渡されます。
    const detail = JSON.parse(e.detail)
    /* Readonlyです {
        videoInfo: watch/<ID>?responseType=json で返ってくる動画情報のオブジェクト, 
        actionTrackId: 現在のレンダーで使っているアクショントラックID,
        commentContent: /v1/threadsで返ってくるコメント情報のオブジェクト,
    }*/
    //console.log(detail)
    // 以前のATIと一緒ならスキップする
    if (detail.actionTrackId !== previousATI) {
        //console.log("Player injecting...")
        /*
        ここに好きに処理を書く。引数でオブジェクトを渡して分離した関数で処理させることをおすすめします
        これでもなお二重実行されることがあるので、必ず要素をappendChildしたりする前に、
        その要素がすでにドキュメント上に存在していないか確認してください
        */
        injectMediaToPlayer(detail)
        // 最後のATIを記録しておく
        previousATI = detail.actionTrackId
    }
})

async function injectMediaToPlayer({ videoInfo, actionTrackId }) {
    // 
    if (document.getElementById("injected-player-root")) return;
    const playerArea = document.getElementById("pmw-player")
    const altControllerContainer = document.createElement("div")
    altControllerContainer.id = "injected-player-root"
    altControllerContainer.textContent = "ページスクリプトでHLSを実行中です。"
    playerArea.appendChild(altControllerContainer)


    if (
        videoInfo.data &&
        videoInfo.data.response &&
        videoInfo.data.response.media &&
        videoInfo.data.response.media.domand &&
        videoInfo.data.response.media.domand.accessRightKey &&
        videoInfo.data.response.media.domand.videos &&
        videoInfo.data.response.media.domand.audios
    ) {
        const accessRightKey = videoInfo.data.response.media.domand.accessRightKey
        const availableVideoQuality = videoInfo.data.response.media.domand.videos
        const availableAudioQuality = videoInfo.data.response.media.domand.audios

        const greatestAudioQuality = returnGreatestQuality(availableAudioQuality)
        // そもそも利用可能な音声クオリティがなかったら終了
        if (!greatestAudioQuality) return false

        // 使えるやつを全部希望する。音声クオリティは常に一番良いものを希望する。
        const hlsRequestBody = {
            outputs: availableVideoQuality.map(elem => {
                if (!elem.isAvailable) return
                return [elem.id, greatestAudioQuality.id]
            })
        }
        const videoElement = document.getElementById("pmw-element-video")
        //testDiv.appendChild(videoElement)
        const hlsResponse = await getHls(location.pathname.slice(7).replace(/\?.*/, ''), JSON.stringify(hlsRequestBody), actionTrackId, accessRightKey)
        const hls = new Hls({ debug: false, xhrSetup: function(xhr, url) {
            // xhrでクッキーを含める
            xhr.withCredentials = true
        }, fetchSetup: function (context, initParams)
        {
            // クロスオリジンであってもクッキーを含める
            initParams.credentials = 'include';
            return new Request(context.url, initParams);
        }})
        hls.log = false
        // videoのrefにアタッチ
        hls.attachMedia(videoElement)
        // 読み込み
        hls.loadSource(hlsResponse.data.contentUrl)
        hls.on(Hls.Events.ERROR, (err) => {
            console.log(err)
        });
    }
}
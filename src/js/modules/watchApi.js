const manifestData = chrome.runtime.getManifest();
export function generateActionTrackId() {
    const atc_first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const atc_last = "0123456789"
    let ati_firststr = ""
    let ati_laststr = ""
    for (let i = 0; i < 10; i++) {
        //console.log(i)
        ati_firststr += atc_first[Math.floor(Math.random() * atc_first.length)]
    }
    for (let i = 0; i < 13; i++) {
        //console.log(i)
        ati_laststr += atc_last[Math.floor(Math.random() * atc_last.length)]
    }
    return ati_firststr + "_" + ati_laststr
}

export async function getHls(videoId, body, actionTrackId, accessRightKey) {
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

export function getVideoInfo(smId) {
    return new Promise(async (resolve, reject) => {
        try {
            // responseType=jsonで取得。
            const response = await fetch(`https://www.nicovideo.jp/watch/${smId}?responseType=json`, {
                "credentials": "include",
                "headers": {
                    "User-Agent": `PepperMintPlus-Watch/${manifestData.version}`,
                },
                "method": "GET"
            })
            if ( !response.ok ) reject("Response is not ok")
            const responseJson = await response.json()
            if ( responseJson.meta.status !== 200 ) reject(responseJson.meta.status)
            resolve(responseJson)
        } catch (err) {
            reject(err)
        }
    })
}

export async function getRecommend(smId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/recommend?recipeId=video_watch_recommendation&videoId=${smId}&limit=25&site=nicovideo&_frontendId=6&_frontendVersion=0`, {
        "credentials": "include",
        "method": "GET",
        "mode": "cors"
    });
    return await response.json()
}

export async function getCommentThread(server, body) {
    const response = await fetch(`${server}/v1/threads`, {
        "credentials": "omit",
        "headers": {
            "Accept": "*/*",
            "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
            "x-client-os-type": "others",
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "Content-Type": "text/plain;charset=UTF-8",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Sec-GPC": "1",
            "Priority": "u=4",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://www.nicovideo.jp/",
        "body": body,
        "method": "POST",
        "mode": "cors"
    });
    return await response.json()
}
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
            if (!response.ok) reject("Response is not ok")
            const responseJson = await response.json()
            if (responseJson.meta.status !== 200) reject(responseJson.meta.status)
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

export async function sendLike(smId, method) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/likes/items?videoId=${smId}`, {
        "headers": {
            "accept": "application/json;charset=utf-8",
            "accept-language": "ja,en-US;q=0.9,en;q=0.8",
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp",
            "x-request-with": `https://www.nicovideo.jp/watch/${smId}`
        },
        "referrer": "https://www.nicovideo.jp/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
    const json = await response.json()
    if (json.meta.status == 200 || json.meta.status == 201) {
        return json
    } else {
        return false
    }
}

export async function getCommentPostKey(threadId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/comment/keys/post?threadId=${threadId}`, {
        "headers": {
            "accept": "application/json;charset=utf-8",
            "accept-language": "ja,en-US;q=0.9,en;q=0.8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp"
        },
        "referrer": "https://www.nicovideo.jp/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return await response.json()
}
export async function postComment(threadId, body) {
    const response = await fetch(`https://public.nvcomment.nicovideo.jp/v1/threads/${threadId}/comments`, {
        "headers": {
            "content-type": "text/plain;charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-client-os-type": "others",
            "x-frontend-id": "6",
            "x-frontend-version": "0"
        },
        "referrer": "https://www.nicovideo.jp/",
        "body": body,
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });
    return await response.json()
}

export async function getNicoruKey(threadId, fork) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/comment/keys/nicoru?threadId=${threadId}&fork=${fork}`, {
        "headers": {
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp"
        },
        "method": "GET",
        "credentials": "include"
    });
    return await response.json()
}

export async function postNicoru(threadId, body) {
    const response = await fetch(`https://public.nvcomment.nicovideo.jp/v1/threads/${threadId}/nicorus`, {
        "headers": {
            "x-client-os-type": "others",
            "x-frontend-id": "6",
            "x-frontend-version": "0"
        },
        "body": body,
        "method": "POST",
        "mode": "cors",
        "credentials": "omit",
        "cache": "no-store"
    });
    return await response.json()
}

export async function removeNicoru(nicoruId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/nicoru/send/${nicoruId}`, {
        "headers": {
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp",
            "x-request-with": "nicovideo"
        },
        "method": "DELETE",
        "mode": "cors",
        "credentials": "include"
    });
    return await response.json()
}

export async function putPlaybackPosition(body) {
    const response = await fetch("https://nvapi.nicovideo.jp/v1/users/me/watch/history/playback-position", {
        "headers": {
            "content-type": "application/json",
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-request-with": "https://www.nicovideo.jp"
        },
        "body": body,
        "method": "PUT",
        "mode": "cors",
        "credentials": "include"
    });
    return await response.json()
}

export async function getCommonsRelatives(videoId, limit = 15) {
    const response = await fetch(`https://public-api.commons.nicovideo.jp/v1/tree/${videoId}/relatives?_limit=${limit}&with_meta=1&_sort=-id`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    if (!response.ok) return null;
    return await response.json()
}

export async function getMylist(mylistId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/playlist/mylist/${mylistId}?sortKey=registeredAt&sortOrder=desc`, {
        "credentials": "include",
        "headers": {
            "accept": "application/json;charset=utf-8",
            "accept-language": "ja,en-US;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
            "X-Niconico-Language": "ja-jp",
        },
        "method": "GET",
        "referrer": "https://www.nicovideo.jp/",
    });
    return await response.json()
}

export async function getSeriesInfo(seriesId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v2/series/${seriesId}`, {
        'method': 'GET',
        "headers": {
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
        },
    })
    return await response.json()
}
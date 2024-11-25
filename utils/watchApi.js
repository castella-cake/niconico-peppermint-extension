
const manifestData = browser.runtime.getManifest();
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
            const response = await fetch(`https://www.nicovideo.jp/watch/${encodeURIComponent(smId)}?responseType=json`, {
                "credentials": "include",
                "headers": {
                    "User-Agent": `PepperMintPlus-Watch/${manifestData.version}`,
                },
                "method": "GET"
            })
            const responseJson = await response.json()
            if (responseJson.meta.status !== 200) reject(responseJson)
            resolve(responseJson)
        } catch (err) {
            reject(err)
        }
    })
}

export async function getRecommend(smId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/recommend?recipeId=video_watch_recommendation&videoId=${encodeURIComponent(smId)}&limit=25&site=nicovideo&_frontendId=6&_frontendVersion=0`, {
        "credentials": "include",
        "method": "GET"
    });
    return await response.json()
}

export async function getCommentThread(server, body) {
    const response = await fetch(`${server}/v1/threads`, {
        "credentials": "omit",
        "headers": {
            "x-client-os-type": "others",
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "body": body,
        "method": "POST",
        "mode": "cors"
    });
    return await response.json()
}

export async function getCommentThreadKey(videoId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/comment/keys/thread?videoId=${encodeURIComponent(videoId)}`, {
        "credentials": "include",
        "headers": {
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
            "X-Niconico-Language": "ja-jp",
        },
        "method": "GET"
    })
    return await response.json()
}

export async function sendLike(smId, method) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/likes/items?videoId=${encodeURIComponent(smId)}`, {
        "headers": {
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp",
            "x-request-with": `https://www.nicovideo.jp/watch/${encodeURIComponent(smId)}`
        },
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
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/comment/keys/post?threadId=${encodeURIComponent(threadId)}`, {
        "headers": {
            "x-frontend-id": "6",
            "x-frontend-version": "0",
            "x-niconico-language": "ja-jp"
        },
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return await response.json()
}
export async function postComment(threadId, body) {
    const response = await fetch(`https://public.nvcomment.nicovideo.jp/v1/threads/${encodeURIComponent(threadId)}/comments`, {
        "headers": {
            "x-client-os-type": "others",
            "x-frontend-id": "6",
            "x-frontend-version": "0"
        },
        "body": body,
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });
    return await response.json()
}

export async function getNicoruKey(threadId, fork) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/comment/keys/nicoru?threadId=${encodeURIComponent(threadId)}&fork=${encodeURIComponent(fork)}`, {
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
    const response = await fetch(`https://public.nvcomment.nicovideo.jp/v1/threads/${encodeURIComponent(threadId)}/nicorus`, {
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
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/nicoru/send/${encodeURIComponent(nicoruId)}`, {
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
    const response = await fetch(`https://public-api.commons.nicovideo.jp/v1/tree/${encodeURIComponent(videoId)}/relatives?_limit=${encodeURIComponent(limit)}&with_meta=1&_sort=-id`, {
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    if (!response.ok) return null;
    return await response.json()
}

export async function getSeriesInfo(seriesId) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v2/series/${encodeURIComponent(seriesId)}`, {
        'method': 'GET',
        "headers": {
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
        },
    })
    return await response.json()
}

export async function getMylist(mylistId, sortKey, sortOrder) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/playlist/mylist/${encodeURIComponent(mylistId)}?sortKey=${encodeURIComponent(sortKey)}&sortOrder=${encodeURIComponent(sortOrder)}`, {
        "credentials": "include",
        "headers": {
            "content-type": "application/json",
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
            "X-Niconico-Language": "ja-jp",
        },
        "method": "GET",
    });
    return await response.json()
}

export async function getMylists() {
    const response = await fetch("https://nvapi.nicovideo.jp/v1/users/me/mylists", {
        "credentials": "include",
        "headers": {
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
            "X-Niconico-Language": "ja-jp",
        },
        "method": "GET",
        "mode": "cors"
    });
    return await response.json()
}

export async function addItemToMylist(mylistId, itemId, requestWith) {
    const response = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/mylists/${encodeURIComponent(mylistId)}/items?itemId=${encodeURIComponent(itemId)}`, {
        "credentials": "include",
        "headers": {
            "X-Frontend-Id": "6",
            "X-Frontend-Version": "0",
            "X-Niconico-Language": "ja-jp",
            "X-Request-With": requestWith,
        },
        "referrer": "https://www.nicovideo.jp/",
        "method": "POST",
        "mode": "cors"
    });
    return await response.json()
}

export async function getPickupSupporters(videoId, limit) {
    const response = await fetch(`https://api.nicoad.nicovideo.jp/v1/contents/video/${encodeURIComponent(videoId)}/pickup_supporters?limit=${encodeURIComponent(limit)}`)
    return await response.json()
}

export async function getDAnimeLinks(videoId) {
    const response = await fetch(`https://public-api.ch.nicovideo.jp/v1/user/channelVideoDAnimeLinks?videoId=${encodeURIComponent(videoId)}`, {
        "headers": {
            "x-frontend-id": "6",
            "x-frontend-version": "0"
        },
        "method": "GET",
        "credentials": "include"
    });
    return await response.json()
}
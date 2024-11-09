import { getHls } from "@/utils/watchApi";
import Hls from "hls.js"
import { useEffect, useMemo, useRef } from "react";

// クオリティ配列から、利用可能な中で最も良いクオリティのオブジェクトを返す。
export function returnGreatestQuality(array) {
    for (const elem of array) {
        if (elem.isAvailable) return elem;
    }
    return false
}

function returnGreatestLevelNumber(preferValue, max) {
    if (preferValue === -1) return -1
    if (max < preferValue) return max
    return preferValue
}

export function useHlsVideo(videoRef, videoInfo, videoId, actionTrackId, isEnabled = true, preferredLevel = -1) {
    const isSupportedBrowser = useMemo(() => Hls.isSupported(), [])
    const hlsRef = useRef(null)
    useEffect(() => {
        async function getSrc() {
            if (!isEnabled) return
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
                const hlsRequestBody = {outputs: availableVideoQuality.map(elem => {
                    if (!elem.isAvailable) return null
                    return [elem.id, greatestAudioQuality.id]
                }).filter(elem => elem !== null)}
                //{\"outputs\":[[\"video-h264-1080p\",\"audio-aac-192kbps\"],[\"video-h264-720p\",\"audio-aac-192kbps\"],[\"video-h264-480p\",\"audio-aac-192kbps\"],[\"video-h264-360p\",\"audio-aac-192kbps\"],[\"video-h264-144p\",\"audio-aac-192kbps\"]]}
                // APIから取得
                const hlsResponse = await getHls(videoId, JSON.stringify(hlsRequestBody), actionTrackId, accessRightKey)
                // 作られてないとかデータが足りないとかだったら終了
                if ( hlsResponse.meta.status != 201 || !hlsResponse.data || !hlsResponse.data.contentUrl ) return
        
                // hls.jsがサポートするならhls.jsで再生し、そうでない(Safariなど)ならネイティブ再生する
                if ( isSupportedBrowser ) {
                    const hls = new Hls({ debug: false, xhrSetup: function(xhr, url) {
                        // xhrでクッキーを含める
                        xhr.withCredentials = true
                    }, fetchSetup: function (context, initParams)
                    {
                        // クロスオリジンであってもクッキーを含める
                        initParams.credentials = 'include';
                        return new Request(context.url, initParams);
                    }, enableCEA708Captions: false })
                    hls.log = false
                    // videoのrefにアタッチ
                    hls.attachMedia(videoRef.current)
                    // 読み込み
                    hls.startLevel = preferredLevel
                    hls.loadSource(hlsResponse.data.contentUrl)
                    hls.on(Hls.Events.ERROR, (err) => {
                        console.log(err)
                    });
                    hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
                        //console.log(data.levels)
                        if ( preferredLevel !== -1 && hls.currentLevel !== preferredLevel ) hls.currentLevel = returnGreatestLevelNumber(preferredLevel, (data.levels.length - 1))
                    })
                    hlsRef.current = hls
                } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    videoRef.current.src = hlsResponse.data.contentUrl;
                }
            } else {
                videoRef.current.src = "";
            }
        }
        getSrc()
    }, [videoInfo])
    return hlsRef
}
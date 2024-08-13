import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";
import { getVideoInfo, getHls, getCommentThread } from "../../../modules/watchApi";
import Hls from "hls.js";
import NiconiComments from "@xpadev-net/niconicomments";

function Player(props) {
    const lang = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()
    // クオリティ配列から、利用可能な中で最も良いクオリティのオブジェクトを返す。
    function returnGreatestQuality(array) {
        for (const elem of array) {
            if (elem.isAvailable) return elem;
        }
        return false
    }
    const isSupportedBrowser = useMemo(() => Hls.isSupported(), [])
    const canvasRef = useRef(null)
    useEffect(() => {
        async function getSrc() {
            // key取得のために動画情報が必要
            const videoInfo = props.videoInfo
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
                if (!greatestAudioQuality) return

                // 使えるやつを全部希望する。音声クオリティは常に一番良いものを希望する。
                const outputs = {outputs: availableVideoQuality.map(elem => {
                    if (!elem.isAvailable) return
                    return [elem.id, greatestAudioQuality.id]
                })}
                //{\"outputs\":[[\"video-h264-1080p\",\"audio-aac-192kbps\"],[\"video-h264-720p\",\"audio-aac-192kbps\"],[\"video-h264-480p\",\"audio-aac-192kbps\"],[\"video-h264-360p\",\"audio-aac-192kbps\"],[\"video-h264-144p\",\"audio-aac-192kbps\"]]}
                // APIから取得
                const hlsResponse = await getHls(props.videoId, JSON.stringify(outputs), props.actionTrackId, accessRightKey)
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
                    }})
                    hls.log = false
                    // videoのrefにアタッチ
                    hls.attachMedia(props.videoRef.current)
                    // 読み込み
                    hls.loadSource(hlsResponse.data.contentUrl)
                    hls.on(Hls.Events.ERROR, (err) => {
                        console.log(err)
                    });
                } else if (props.videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    props.videoRef.current.src = hlsResponse.data.contentUrl;
                }
                
                // "{\"params\":{\"targets\":[{\"id\":\"1713523688\",\"fork\":\"owner\"},{\"id\":\"1713523688\",\"fork\":\"main\"},{\"id\":\"1713523688\",\"fork\":\"easy\"}],\"language\":\"ja-jp\"},\"threadKey\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI2NmJhMGFjYzk5ZjZhIiwiZXhwIjoxNzIzNDY4ODIyLCJ0eXAiOiJUaHJlYWQtS2V5IiwidGlkcyI6WyIxNzEzNTIzNjg4Il0sImYxODRzIjpbXSwidWlkIjoiOTIzNDMzNTQifQ.AlUqG1F31R0WA8vsWgImaeVUEFwQLwrLZqnuw4FU4xND8qbnfbEK8I9GBzIPK3Xzn5MjFiT_gqRY_a9-MJJfGA\",\"additionals\":{}}"
                console.log(props.commentContent)
                if ( !props.commentContent.data ) return
                const niconiComments = new NiconiComments(canvasRef.current, props.commentContent.data.threads, { format: "v1" })
                const renderInterval = setInterval(() => {
                    niconiComments.drawCanvas(props.videoRef.current.currentTime * 100)
                }, 16)
                return () => clearInterval(renderInterval);
            }
        }
        getSrc()
    }, [props.videoInfo, props.commentContent])

    return <div className="player-container">
        <div className="player-video-container">
            <video ref={props.videoRef} controls autoPlay></video>
            <canvas ref={canvasRef} width="1920" height="1080"/>
        </div>
    </div>
}


export default Player;
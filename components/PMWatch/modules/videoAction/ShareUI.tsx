import { VideoDataRootObject } from "@/types/VideoData";

export function Share({ videoInfo }: { videoInfo: VideoDataRootObject } ) {
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response
    const shareURL = `https://www.nicovideo.jp/watch/${videoInfoResponse.video.id}`
    const hashtags = [videoInfoResponse.video.id, "ニコニコ動画", "PepperMintShare"]
    const shareBody = `${videoInfoResponse.video.title} - by ${videoInfoResponse.owner ? videoInfoResponse.owner.nickname : "非公開または退会済みユーザー"}\n${shareURL}\n#${hashtags.join(" #")}`
    // Twitterとか各項目で改行してくれないので、全部bodyに押し込むことにした
    const shareIntents = {
        "twitter": `https://x.com/intent/tweet?text=${encodeURIComponent(shareBody)}`,
        "misskeyHub": `https://misskey-hub.net/share/?text=${encodeURIComponent(shareBody)}&visibility=public&localOnly=0`,
        "bluesky": `https://bsky.app/intent/compose?text=${encodeURIComponent(shareBody)}`,
    }
    return <div className="share-container">
        <div className="share-body">
            {shareBody}
        </div>
        <a className="share-button share-button-x" href={shareIntents["twitter"]} target="_blank">
            Xに共有
        </a>
        <a className="share-button share-button-misskey" href={shareIntents["misskeyHub"]} target="_blank">
            Misskeyに共有
        </a>
        <a className="share-button share-button-bluesky" href={shareIntents["bluesky"]} target="_blank">
            Blueskyに共有
        </a>
    </div>
}
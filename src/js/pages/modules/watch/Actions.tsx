import { IconFolderFilled, IconHeart, IconHeartFilled, IconShare, IconSpeakerphone, IconX } from "@tabler/icons-react";
import type { VideoDataRootObject } from "./types/VideoData";
import { useEffect, useState } from "react";
import { sendLike } from "../../../modules/watchApi";


type Props = {
    videoInfo: VideoDataRootObject
}

function readableInt(number: number) {
    const units = ["万","億","兆","京","垓","秭","穣","溝","潤","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"]
    if ( number.toString().indexOf("e") == -1 ) {
        const stringArray = number.toString().split("").reverse()
        const afterStringArray = stringArray.map((char, index) => {
            if ((index) % 4 !== 0) return char
            return `${char}${units[((index) / 4) - 1] || ""}`
        })
        return afterStringArray.reverse().join("")
    } else {
        return number
    }
}

function Actions({videoInfo}: Props) {
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [likeThanksMsg, setLikeThanksMsg] = useState<string | null>(null)
    const [isLikeThanksMsgClosed, setIsLikeThanksMsgClosed] = useState(false)
    const [temporalLikeModifier, setTemporalLikeModifier] = useState<number>(0) // videoInfoに焼き込まれていない「いいね」のための加算。
    useEffect(() => {
        if (!videoInfo.data) return
        setTemporalLikeModifier(0)
        setIsLiked(videoInfo.data.response.video.viewer.like.isLiked)
        setLikeThanksMsg(null)
        setIsLikeThanksMsgClosed(false)
    }, [videoInfo])
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response
    const shareURL = `https://www.nicovideo.jp/watch/${videoInfoResponse.video.id}`
    const hashtags = [videoInfoResponse.video.id, "ニコニコ動画", "PepperMintShare"]
    const shareBody = `${videoInfoResponse.video.title} - by ${videoInfoResponse.owner ? videoInfoResponse.owner.nickname : "非公開または退会済みユーザー"}\n${shareURL}\n#${hashtags.join(" #")}`
    // Twitterとか各項目で改行してくれないので、全部bodyに押し込むことにした
    const shareIntents = {
        "twitter": `https://x.com/intent/tweet?text=${encodeURIComponent(shareBody)}`
    }

    async function likeChange() {
        const likeResponse = await sendLike(videoInfoResponse.video.id, !isLiked)
        if ( likeResponse ) {
            if (!isLiked) {
                setTemporalLikeModifier(temporalLikeModifier + 1)
            } else {
                setTemporalLikeModifier(temporalLikeModifier - 1)
            }
            setIsLiked(!isLiked)
            if ( likeResponse.data && likeResponse.data.thanksMessage ) {
                setLikeThanksMsg(likeResponse.data.thanksMessage)
                setIsLikeThanksMsgClosed(false)
            }
        }
    }

    function onAdsClicked() {
        window.open(`https://nicoad.nicovideo.jp/video/publish/${videoInfo.data?.response.video.id}`, "_blank", "width=500,height=700,popup=yes")
    }

    function onShareClicked() {
        window.open(shareIntents.twitter, "_blank")
    }

    /*function ShareSelector() {
        return <select>
            <option value="x.com">X</option>
            {syncStorage.shareinstancelist && syncStorage.shareinstancelist.map((server: string, index: number) => {
                return <option key={`shareinstancelist-${index}`} value={server}>{server}</option>
            })}
        </select>
    }*/

    return <div className="video-actions" id="pmw-videoactions">
        { /* row-reverse です！！！！ */}
        <button type="button" className="video-action-mylistbutton video-action-disabled"><IconFolderFilled/></button>
        <button type="button" className="video-action-adbutton" onClick={onAdsClicked} title="ニコニ広告する"><IconSpeakerphone/> <span>ニコニ広告</span></button>
        <button type="button" className="video-action-sharebutton" onClick={onShareClicked}><IconShare/> <span>共有</span></button>
        <button type="button" onClick={likeChange} className="video-action-likebutton">
            {isLiked ? <IconHeartFilled/> : <IconHeart/>}
            <span>いいね！{readableInt(videoInfoResponse.video.count.like + temporalLikeModifier)}</span>
        </button>
        {isLiked && likeThanksMsg && !isLikeThanksMsgClosed && <div className="video-action-likethanks-outercontainer">
            <div className="video-action-likethanks-container">
                <div className="global-flex video-action-likethanks-title"><span className="global-flex1">いいね！へのお礼メッセージ</span><button type="button" title="お礼メッセージを閉じる" onClick={() => {setIsLikeThanksMsgClosed(true)}}><IconX/></button></div>
                <div className="global-flex">
                    { videoInfo.data.response.owner && videoInfo.data.response.owner.iconUrl &&
                        <img src={videoInfo.data.response.owner.iconUrl} className="video-action-likethanks-icon"></img>
                    }
                    <span className="video-action-likethanks-arrow "/><div className="video-action-likethanks-body global-flex1">{likeThanksMsg}</div>
                </div>
            </div>
        </div>}
    </div>
}


export default Actions;
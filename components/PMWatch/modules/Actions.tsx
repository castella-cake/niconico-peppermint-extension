import { IconFolder, IconHeart, IconHeartFilled, IconShare, IconSpeakerphone, IconX } from "@tabler/icons-react";
import type { VideoDataRootObject } from "@/types/VideoData";
import { ReactNode, useEffect, useState } from "react";
import { sendLike } from "../../../utils/watchApi";
import { readableInt } from "./commonFunction";


type Props = {
    videoInfo: VideoDataRootObject,
    children?: ReactNode,
    onModalOpen: (modalType: "mylist" | "share") => void,
}

function Actions({videoInfo, children, onModalOpen}: Props) {
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [likeThanksMsg, setLikeThanksMsg] = useState<string | null>(null)
    const [isLikeThanksMsgClosed, setIsLikeThanksMsgClosed] = useState(false)
    const [isLikeHovered, setIsLikeHovered] = useState(false)
    const [temporalLikeModifier, setTemporalLikeModifier] = useState<number>(0) // videoInfoに焼き込まれていない「いいね」のための加算。
    //const [isMylistWindowOpen, setIsMylistWindowOpen] = useState<boolean>(false)
    useEffect(() => {
        if (!videoInfo.data) return
        setTemporalLikeModifier(0)
        setIsLiked(videoInfo.data.response.video.viewer ? videoInfo.data.response.video.viewer.like.isLiked : false)
        if (videoInfo.data.response.video.viewer && videoInfo.data.response.video.viewer.like.isLiked) {
            async function getData() {
                const likeResponse = await sendLike(videoInfoResponse.video.id, "GET")
                if ( likeResponse && likeResponse.data && likeResponse.data.thanksMessage) {
                    setLikeThanksMsg(likeResponse.data.thanksMessage)
                }
            }
            getData()
        } else {
            setLikeThanksMsg(null)
        }
        setIsLikeThanksMsgClosed(false)
    }, [videoInfo])
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    async function likeChange() {
        if ( !videoInfo.data || !videoInfo.data.response.video.viewer ) return;
        const method = isLiked ? "DELETE" : "POST"
        const likeResponse = await sendLike(videoInfoResponse.video.id, method)
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
        onModalOpen("share")
    }

    function onMylistClicked() {
        onModalOpen("mylist")
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
        { /* row-reverse じゃなくなりました！！！！ */}
        <button type="button" onClick={likeChange} onMouseEnter={() => setIsLikeHovered(true)} onMouseLeave={() => setIsLikeHovered(false)} className="video-action-likebutton" title="いいね！" is-liked={isLiked ? "true" : "false"}>
            {isLiked ? <IconHeartFilled/> : <IconHeart/>}
            <span>いいね！{readableInt(videoInfoResponse.video.count.like + temporalLikeModifier)}</span>
        </button>
        <button type="button" className="video-action-adbutton" onClick={onAdsClicked} title="ニコニ広告する"><IconSpeakerphone/> <span>ニコニ広告</span></button>
        <button type="button" className="video-action-sharebutton" onClick={onShareClicked} title="共有"><IconShare/></button>
        <button type="button" className="video-action-mylistbutton" onClick={onMylistClicked} title="マイリスト"><IconFolder/></button>
        {isLiked && likeThanksMsg && ( (videoInfo.data.response.video.viewer.like.isLiked && isLikeHovered) || (!videoInfo.data.response.video.viewer.like.isLiked && (!isLikeThanksMsgClosed || isLikeHovered)) ) && <div className="video-action-likethanks-outercontainer">
            <div className="video-action-likethanks-container">
                <div className="global-flex video-action-likethanks-title">
                    <span className="global-flex1">いいね！へのお礼メッセージ</span>
                    { !videoInfo.data.response.video.viewer.like.isLiked &&<button type="button" title="お礼メッセージを閉じる" onClick={() => {setIsLikeThanksMsgClosed(true)}}><IconX/></button> }
                </div>
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

/*
    <div className="video-action-mylists-outercontainer" is-open={isMylistWindowOpen ? "true" : undefined}>
        <Mylist videoInfo={videoInfo} onClose={onMylistClicked}/>
    </div>
*/


export default Actions;
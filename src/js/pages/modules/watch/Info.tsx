import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import type { VideoDataRootObject } from "./types/VideoData";
import { useEffect, useState } from "react";
import { sendLike } from "../../../modules/watchApi";


type Props = {
    videoInfo: VideoDataRootObject
}

function Info({videoInfo}: Props) {
    const [isLiked, setIsLiked] = useState<boolean>(false)
    useEffect(() => {
        if (!videoInfo.data) return
        setIsLiked(videoInfo.data.response.video.viewer.like.isLiked)
    }, [videoInfo])
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response
    

    // Scary!
    const innerHTMLObj = { __html: videoInfoResponse.video.description }

    async function likeChange() {
        const likeResponse = await sendLike(videoInfoResponse.video.id, !isLiked)
        if ( likeResponse ) {
            setIsLiked(!isLiked)
        }
    }

    return <div className="videoinfo-container">
        <div className="videoinfo-titlecontainer">
            <div className="videoinfo-titleinfo">
                <div className="videotitle">{videoInfoResponse.video.title}</div>
                <div className="videostats">再生: {videoInfoResponse.video.count.view} / コメント: {videoInfoResponse.video.count.comment} / マイリスト: {videoInfoResponse.video.count.mylist}</div>
            </div>
            <div className="videoinfo-actions">
                <button type="button" onClick={likeChange} className="videoinfo-likebutton">{isLiked ? <IconHeartFilled/> : <IconHeart/>}<span>いいね！</span></button>
            </div>
        </div>
        <details>
            <summary>この動画の概要</summary>
            <div className="videodesc" dangerouslySetInnerHTML={innerHTMLObj}/>
        </details>
        <div className="global-flex bottom-container">
            <div className="tags-container global-flex1">{videoInfoResponse.tag.items.map((elem,index) => {
                return <div key={`${index}-thistag`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}>{elem.name}</div>
            })}</div>
            <div className="owner-container">
                {videoInfoResponse.owner && <>
                    { videoInfoResponse.owner.iconUrl && <img src={videoInfoResponse.owner.iconUrl}/> }
                    <span>
                        { videoInfoResponse.owner.nickname }
                    </span>
                </>}
            </div>
        </div>
    </div>
}


export default Info;
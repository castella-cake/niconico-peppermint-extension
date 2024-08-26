import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
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
                <div className="videostats"><span>再生: {readableInt(videoInfoResponse.video.count.view)}</span> / <span>コメント: {readableInt(videoInfoResponse.video.count.comment)}</span> / <span>マイリスト: {readableInt(videoInfoResponse.video.count.mylist)}</span></div>
            </div>
            <div className="videoinfo-actions">
                <button type="button" onClick={likeChange} className="videoinfo-likebutton">{isLiked ? <IconHeartFilled/> : <IconHeart/>}<span>いいね！</span></button>
            </div>
            <div className="videoinfo-owner">
                {videoInfoResponse.owner && <a href={`https://www.nicovideo.jp/user/${videoInfoResponse.owner.id}`}>
                    { videoInfoResponse.owner.iconUrl && <img src={videoInfoResponse.owner.iconUrl}/> }
                    <span>
                        { videoInfoResponse.owner.nickname }
                    </span>
                </a>}
            </div>
        </div>
        <details>
            <summary>この動画の概要</summary>
            <div className="videodesc" dangerouslySetInnerHTML={innerHTMLObj}/>
        </details>
        <div className="tags-container">
            {videoInfoResponse.tag.items.map((elem,index) => {
                return <div key={`${index}-thistag`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}><a href={`/tag/${elem.name}`}>{elem.name}</a> <a href={`https://dic.nicovideo.jp/a/${elem.name}`} className={elem.isNicodicArticleExists ? "tags-item-nicodic" : "tags-item-nicodic tags-item-nicodic-notexist"}>{elem.isNicodicArticleExists ? "百" : "？"}</a></div>
            })}
        </div>
    </div>
}


export default Info;
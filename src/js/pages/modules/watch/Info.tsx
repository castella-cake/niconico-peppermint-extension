import type { VideoDataRootObject } from "./types/VideoData";


type Props = {
    videoInfo: VideoDataRootObject
}

function Info({videoInfo}: Props) {
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    // Scary!
    const innerHTMLObj = { __html: videoInfoResponse.video.description }

    return <div className="videoinfo-container">
        <div className="videotitle">{videoInfoResponse.video.title}{ videoInfoResponse.owner && <span>by {videoInfoResponse.owner.nickname}</span> }</div>
        <details>
            <summary>この動画の概要</summary>
            <div className="videodesc" dangerouslySetInnerHTML={innerHTMLObj}/>
        </details>
        <div className="tags-container">{videoInfoResponse.tag.items.map((elem,index) => {
            return <div key={`${index}-thistag`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}>{elem.name}</div>
        })}</div>
    </div>
}


export default Info;
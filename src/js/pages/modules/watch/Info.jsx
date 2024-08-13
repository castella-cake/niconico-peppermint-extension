import { useEffect, useMemo, useState, useRef } from "react";
import { useStorageContext } from "../extensionHook";
import { useLang } from "../localizeHook";

function Info(props) {
    const lang = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()
    if (!props.videoInfo.data) return <></>

    const videoInfo = props.videoInfo.data.response

    // Scary!
    const innerHTMLObj = { __html: videoInfo.video.description }

    return <div className="videoinfo-container">
        <div className="videotitle">{videoInfo.video.title}{ videoInfo.owner && <span>by {videoInfo.owner.nickname}</span> }</div>
        <details>
            <summary>この動画の概要</summary>
            <div className="videodesc" dangerouslySetInnerHTML={innerHTMLObj}/>
        </details>
        <div className="tags-container">{videoInfo.tag.items.map((elem,index) => {
            return <div key={`${index}-thistag`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}>{elem.name}</div>
        })}</div>
    </div>
}


export default Info;
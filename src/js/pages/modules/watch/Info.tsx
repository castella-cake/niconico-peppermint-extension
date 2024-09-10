import { IconFolderFilled, IconMessageFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import type { VideoDataRootObject } from "./types/VideoData";
import { MouseEvent, RefObject, useState } from "react";
import { useStorageContext } from "../extensionHook";
import * as DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser";


type Props = {
    videoInfo: VideoDataRootObject,
    videoRef: RefObject<HTMLVideoElement>,
}

function htmlToText(htmlString: string) {
    const dummyDiv = document.createElement("div")
    dummyDiv.innerHTML = htmlString;
    return dummyDiv.textContent || dummyDiv.innerText || "";
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

function Info({videoInfo, videoRef}: Props) {
    const { localStorage, setLocalStorageValue } = useStorageContext()
    const [isDescOpen, setIsDescOpen] = useState<boolean>(localStorage.playersettings.descriptionOpen || false)
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorage.playersettings, [name]: value })
    }
    if (!videoInfo.data) return <></>

    const videoInfoResponse = videoInfo.data.response

    // Not scary!
    const sanitizedDesc = DOMPurify.sanitize(videoInfoResponse.video.description || "")
    const descElem = HTMLReactParser(sanitizedDesc)

    const handleAnchorClick = (e: MouseEvent<HTMLDivElement>) => {
        if ( e.target instanceof Element ) {
            const nearestAnchor: HTMLAnchorElement | null = e.target.closest("a")
            if ( nearestAnchor && nearestAnchor.getAttribute("data-seektime") ) {
                e.stopPropagation()
                e.preventDefault()
                if (videoRef.current) {
                    const seekTimeArray = nearestAnchor.getAttribute("data-seektime")?.split(":")
                    // 反転して秒:分:時:日としていき、順に秒に直したらreduceですべて加算
                    const seekToTime = seekTimeArray?.reverse().map((time, index) => {
                        if ( index === 0 ) return Number(time) // 秒
                        if ( index <= 2 ) return Number(time) * (60 ^ index) // 分/時
                        return Number(time) * 172800 // 日
                    }).reduce((prev,current) => prev + current)
                    if (seekToTime) videoRef.current.currentTime = seekToTime
                }
            }
        }
    }
    /*function ShareSelector() {
        return <select>
            <option value="x.com">X</option>
            {syncStorage.shareinstancelist && syncStorage.shareinstancelist.map((server: string, index: number) => {
                return <option key={`shareinstancelist-${index}`} value={server}>{server}</option>
            })}
        </select>
    }*/

    return <div className="videoinfo-container" id="pmw-videoinfo">
        <div className="videoinfo-titlecontainer">
            <div className="videoinfo-titleinfo">
                <div className="videotitle">{videoInfoResponse.video.title}</div>
                <div className="videostats">
                    <span>{new Date(videoInfoResponse.video.registeredAt).toLocaleString('ja-JP')}</span>
                    <span><IconPlayerPlayFilled/>{readableInt(videoInfoResponse.video.count.view)}</span>
                    <span><IconMessageFilled/>{readableInt(videoInfoResponse.video.count.comment)}</span>
                    <span><IconFolderFilled/>{readableInt(videoInfoResponse.video.count.mylist)}</span>
                </div>
            </div>
            <div className="videoinfo-owner">
                {videoInfoResponse.owner && <a href={`https://www.nicovideo.jp/user/${videoInfoResponse.owner.id}`}>
                    { videoInfoResponse.owner.iconUrl && <img src={videoInfoResponse.owner.iconUrl}/> }
                    <span>
                        { videoInfoResponse.owner.nickname }
                    </span>
                </a>}
                {videoInfoResponse.channel && <a href={`https://ch.nicovideo.jp/${videoInfoResponse.channel.id}`}>
                    { videoInfoResponse.channel.thumbnail.smallUrl && <img src={videoInfoResponse.channel.thumbnail.smallUrl}/> }
                    <span>
                        { videoInfoResponse.channel.name }
                    </span>
                </a>}
            </div>
        </div>
        <details open={isDescOpen && true} onToggle={(e) => {setIsDescOpen(e.currentTarget.open);writePlayerSettings("descriptionOpen", e.currentTarget.open)}}>
            <summary>この動画の概要 {!isDescOpen && <span>{htmlToText(sanitizedDesc)}</span>}</summary>
            <div className="videodesc" onClickCapture={(e) => {handleAnchorClick(e)}}>
                {descElem}
            </div>
        </details>
        <div className="tags-container">
            {videoInfoResponse.tag.items.map((elem,index) => {
                return <div key={`tag-${elem.name}`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}>
                    <a href={`/tag/${elem.name}`}>{elem.name}</a> <a href={`https://dic.nicovideo.jp/a/${elem.name}`} className={elem.isNicodicArticleExists ? "tags-item-nicodic" : "tags-item-nicodic tags-item-nicodic-notexist"}>{elem.isNicodicArticleExists ? "百" : "？"}</a>
                </div>
            })}
        </div>
    </div>
}


export default Info;
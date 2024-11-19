import { IconClockHour4Filled, IconEdit, IconExclamationCircleFilled, IconFolderFilled, IconMessageFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import type { ErrorResponse, VideoDataRootObject } from "@/types/VideoData";
import { MouseEvent, RefObject, useState } from "react";
import DOMPurify from "dompurify";
import HTMLReactParser from "html-react-parser";
import { readableInt } from "./commonFunction";
import { useStorageContext } from "@/hooks/extensionHook";


type Props = {
    videoInfo: VideoDataRootObject,
    videoRef: RefObject<HTMLVideoElement>,
    isTitleShown: boolean,
    errorInfo: any,
    isShinjukuLayout: boolean
}

function htmlToText(htmlString: string) {
    const dummyDiv = document.createElement("div")
    dummyDiv.innerHTML = htmlString;
    return dummyDiv.textContent || dummyDiv.innerText || "";
}

function ErrorUI({ error }: { error: any }) {
    if (!error.data || !error.data.response) return <div className="videoinfo-error-container">動画の取得に失敗しました</div> 
    const errorResponse: ErrorResponse = error.data.response
    return <div className="videoinfo-container errorinfo-container">
        <div className="videoinfo-titlecontainer">
            <div className="videoinfo-titleinfo">
                <div className="videotitle"><IconExclamationCircleFilled/>{errorResponse.statusCode}: {errorResponse.reasonCode}</div>
                動画の取得に失敗しました。動画が削除されたか、サーバーに接続できなかった可能性があります。
                削除動画→<a href="https://www.nicovideo.jp/watch/sm38213757">sm38213757</a>
            </div>
        </div>
    </div>
}

export function Title({ videoInfo }: { videoInfo: VideoDataRootObject }) {
    if (!videoInfo.data) return
    const videoInfoResponse = videoInfo.data.response
    return <div className="videotitle-container">
        <div className="videotitle">{videoInfoResponse.video.title}</div>
        <div className="videostats">
            <span>{new Date(videoInfoResponse.video.registeredAt).toLocaleString('ja-JP')}</span>
            <span><IconPlayerPlayFilled/>{readableInt(videoInfoResponse.video.count.view)}</span>
            <span><IconMessageFilled/>{readableInt(videoInfoResponse.video.count.comment)}</span>
            <span><IconFolderFilled/>{readableInt(videoInfoResponse.video.count.mylist)}</span>
        </div>
    </div>
}

function Info({videoInfo, videoRef, isShinjukuLayout, isTitleShown, errorInfo}: Props) {
    const { localStorage, setLocalStorageValue } = useStorageContext()
    const localStorageRef = useRef<any>(null)
    localStorageRef.current = localStorage
    function writePlayerSettings(name: string, value: any, silent: boolean = false) {
        setLocalStorageValue("playersettings", { ...localStorageRef.current.playersettings, [name]: value }, silent)
    }
    const [isDescOpen, setIsDescOpen] = useState<boolean>(localStorage.playersettings.descriptionOpen || false)
    if (errorInfo !== false) return <ErrorUI error={errorInfo}/>
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
    const nicodicExistIcon = isShinjukuLayout ? <img src="http://nicovideo.cdn.nimg.jp/web/img/common/icon/dic_on.png"/> : "百"
    const nicodicNotExistIcon = isShinjukuLayout ? <img src="http://nicovideo.cdn.nimg.jp/web/img/common/icon/dic_off.png"/> : "？"

    return <div className="videoinfo-container" id="pmw-videoinfo">
        <div className="videoinfo-titlecontainer">
            <div className="videoinfo-titleinfo">
                { isShinjukuLayout && <div className="uploaddate">
                    <strong>{new Date(videoInfoResponse.video.registeredAt).toLocaleString('ja-JP')}</strong> 投稿の{videoInfoResponse.channel ? "公式" : "ユーザー"}動画
                    <span className="threeleader"> … </span><strong>{videoInfoResponse.genre.isNotSet ? "未設定" : videoInfoResponse.genre.label} </strong> 
                    カテゴリ{videoInfoResponse.ranking.genre ? `(過去最高順位: ${videoInfoResponse.ranking.genre.rank}位)` : "" }
                </div> }
                { isTitleShown && <div className="videotitle">{videoInfoResponse.video.title}</div> }
                { (!isShinjukuLayout && isTitleShown) && <div className="videostats">
                    <span><IconClockHour4Filled/>{new Date(videoInfoResponse.video.registeredAt).toLocaleString('ja-JP')}</span>
                    <span><IconPlayerPlayFilled/>{readableInt(videoInfoResponse.video.count.view)}</span>
                    <span><IconMessageFilled/>{readableInt(videoInfoResponse.video.count.comment)}</span>
                    <span><IconFolderFilled/>{readableInt(videoInfoResponse.video.count.mylist)}</span>
                    <span>{videoInfoResponse.genre.isNotSet ? "未設定" : videoInfoResponse.genre.label}{videoInfoResponse.ranking.genre ? `(過去最高順位: ${videoInfoResponse.ranking.genre.rank}位)` : "" }</span>
                </div> }
            </div>
            { !isShinjukuLayout && <div className="videoinfo-owner">
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
            </div>}
        </div>
        { isShinjukuLayout && <button className="videoinfo-hjdesc-tabbutton" onClick={(e) => {setIsDescOpen(!isDescOpen);writePlayerSettings("descriptionOpen", !isDescOpen, true)}}>{isDescOpen ? "▲" : "▼"} 動画概要</button>}
        <details open={isDescOpen && true} onToggle={(e) => {setIsDescOpen(e.currentTarget.open);writePlayerSettings("descriptionOpen", e.currentTarget.open, true)}}>
            <summary>この動画の概要 {!isDescOpen && <span>{htmlToText(sanitizedDesc)}</span>}</summary>
            <div className="videodesc" onClickCapture={(e) => {handleAnchorClick(e)}}>
                {descElem}
            </div>
        </details>
        <div className="tags-container">
            <div className="tags-title">
                <span>登録タグ</span>
            </div>
            <div className="tags-item-container">
                {videoInfoResponse.tag.items.map((elem,index) => {
                    return <div key={`tag-${elem.name}`} className={elem.isLocked ? "tags-item tags-item-locked" : "tags-item"}>
                        <a href={`/tag/${elem.name}`}>
                            {elem.name}
                        </a>
                        <a href={`https://dic.nicovideo.jp/a/${elem.name}`} className={elem.isNicodicArticleExists ? "tags-item-nicodic" : "tags-item-nicodic tags-item-nicodic-notexist"}>
                            {elem.isNicodicArticleExists ? nicodicExistIcon : nicodicNotExistIcon}
                        </a>
                    </div>
                })}
                <button className="tags-editbutton disabled" aria-disabled="true">
                    <IconEdit/>編集
                </button>
            </div>
        </div>
    </div>
}


export default Info;
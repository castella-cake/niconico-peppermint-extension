import { IconFolder, IconShare, IconX } from "@tabler/icons-react";
import ReactFocusLock from "react-focus-lock";
import { Mylist } from "./MylistUI";
import { VideoDataRootObject } from "@/types/VideoData";
import { Share } from "./ShareUI";
import { RefObject } from "react";

export function VideoActionModal({ onModalStateChanged, selectedType, videoInfo, nodeRef }: { onModalStateChanged: (isModalOpen: boolean, modalType: "mylist" | "share") => void, selectedType: "mylist" | "share", videoInfo: VideoDataRootObject, nodeRef: RefObject<HTMLDivElement> }) {
    return <ReactFocusLock>
        <div className="videoaction-modal-wrapper" ref={nodeRef}>
            <div className="videoaction-modal-container">
                <div className="videoaction-modal-header global-flex">
                    <h2 className="global-flex1">動画アクション</h2>
                    <button className="videoaction-modal-close" onClick={() => {onModalStateChanged(false, "mylist")}}><IconX/></button>
                </div>
                <div className="videoaction-left">
                    <button className="videoaction-select" onClick={() => {onModalStateChanged(true, "mylist")}} is-active={selectedType === "mylist" ? "true" : "false"}><IconFolder/> マイリスト</button>
                    <button className="videoaction-select" onClick={() => {onModalStateChanged(true, "share")}} is-active={selectedType === "share" ? "true" : "false"}><IconShare/> 共有</button>
                </div>
                <div className="videoaction-content">
                    { selectedType === "mylist" && <Mylist onClose={() => {}} videoInfo={videoInfo}/> }
                    { selectedType === "share" && <Share videoInfo={videoInfo}/> }
                </div> 
            </div>
        </div>
    </ReactFocusLock>
}
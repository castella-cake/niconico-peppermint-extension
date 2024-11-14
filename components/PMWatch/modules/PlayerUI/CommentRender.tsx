import { Thread } from "@/types/CommentData";
import NiconiComments from "@xpadev-net/niconicomments";
import { RefObject } from "react";

// コメントレンダラー
export function CommentRender({ videoRef, pipVideoRef, isCommentShown, commentOpacity, threads, videoOnClick, enableCommentPiP }: {
    videoRef: RefObject<HTMLVideoElement>,
    pipVideoRef: RefObject<HTMLVideoElement>,
    isCommentShown: boolean,
    commentOpacity: number,
    threads: Thread[],
    videoOnClick: () => void,
    enableCommentPiP: boolean,
}) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const niconicommentsRef = useRef<NiconiComments | null>(null!)
    useEffect(() => { // とりあえずこれでパフォーマンスが改善したけど、returnするときにnull入れてるのが良いのか、要素非表示をCSSに任せているのが良いのか、captureStreamを一回だけ作ってるのが良いのかはよくわからない
        if (
            canvasRef.current &&
            threads &&  
            videoRef.current
        ) {
            //console.log("niconicomments redefined")
            niconicommentsRef.current = new NiconiComments(canvasRef.current, threads, { format: "v1", enableLegacyPiP: true, video: undefined }) // (localStorage.playersettings.enableCommentPiP ? videoRef.current : undefined)
            /*if (localStorage.playersettings.enableCommentPiP && pipVideoRef.current && !pipVideoRef.current.srcObject) {
                pipVideoRef.current.srcObject = canvasRef.current.captureStream()
            }*/
            return () => {
                niconicommentsRef.current = null
                if (pipVideoRef.current) pipVideoRef.current.srcObject = null
            }
        }
    }, [threads, enableCommentPiP])
    useInterval(() => {
        if (!videoRef.current || !isCommentShown || !niconicommentsRef.current) return
        niconicommentsRef.current.drawCanvas(videoRef.current.currentTime * 100)
    }, Math.floor(1000 / 60))
    return <>
        <canvas ref={canvasRef} width="1920" height="1080" style={isCommentShown ? {opacity: commentOpacity} : {opacity: 0}} id="pmw-element-commentcanvas"/>
        <video
            ref={pipVideoRef}
            className="player-commentvideo-pip"
            width="1920"
            height="1080"
            autoPlay
            onPause={() => {videoRef.current && videoRef.current.pause()}}
            onPlay={() => {videoRef.current && videoRef.current.play()}}
            onClick={videoOnClick}
        >
        </video>
    </>
}

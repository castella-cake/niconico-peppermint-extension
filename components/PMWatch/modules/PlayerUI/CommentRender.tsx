import { Comment, Thread } from "@/types/CommentData";
import NiconiComments from "@xpadev-net/niconicomments";
import { RefObject } from "react";

// コメントレンダラー
export function CommentRender({ videoRef, pipVideoRef, isCommentShown, commentOpacity, threads, videoOnClick, enableCommentPiP, commentRenderFps, disableCommentOutline, previewCommentItem, defaultPostTargetIndex }: {
    videoRef: RefObject<HTMLVideoElement>,
    pipVideoRef: RefObject<HTMLVideoElement>,
    isCommentShown: boolean,
    commentOpacity: number,
    threads: Thread[],
    videoOnClick: () => void,
    enableCommentPiP: boolean,
    commentRenderFps: number,
    previewCommentItem: null | Comment,
    defaultPostTargetIndex: number,
    disableCommentOutline: boolean,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const niconicommentsRef = useRef<NiconiComments | null>(null!)
    const animationFrameIdRef = useRef<number>(null!)
    const fpsRef = useRef<number>(null!)
    fpsRef.current = commentRenderFps
    function drawWithAnimationFrame() {
        if (!videoRef.current || !niconicommentsRef.current) return
        niconicommentsRef.current.drawCanvas(videoRef.current.currentTime * 100)
        if (fpsRef.current == -1) animationFrameIdRef.current = requestAnimationFrame(drawWithAnimationFrame)
    }
    useEffect(() => {
        if (
            canvasRef.current &&
            threads &&  
            videoRef.current
        ) {
            console.log("niconicomments redefined")
            // プレビューコメントを追加
            if (previewCommentItem && defaultPostTargetIndex !== -1) {
                threads[defaultPostTargetIndex].comments = threads[defaultPostTargetIndex].comments.filter(comment => comment.id !== "-1") // ID-1はプレビューコメント。前回のプレビューが残らないように一旦消してからpushする。
                threads[defaultPostTargetIndex].comments.push(previewCommentItem)
            } else if (defaultPostTargetIndex !== -1) {
                threads[defaultPostTargetIndex].comments = threads[defaultPostTargetIndex].comments.filter(comment => comment.id !== "-1") // プレビューが終わった後も残らないように常にフィルターする。
            }

            niconicommentsRef.current = new NiconiComments(canvasRef.current, threads, {
                format: "v1",
                enableLegacyPiP: true,
                video: (enableCommentPiP ? videoRef.current : undefined),
                mode: "html5",
                config: (disableCommentOutline ? {
                    contextLineWidth: { html5: 0, flash: 0 },
                    contextStrokeColor: "#000000",
                    contextStrokeOpacity: 0,
                } : {})
            }) // 

            // PiP用のvideo要素にキャンバスの内容を流す
            if (enableCommentPiP && pipVideoRef.current && !pipVideoRef.current.srcObject) {
                pipVideoRef.current.srcObject = canvasRef.current.captureStream()
            }
            if (commentRenderFps == -1) drawWithAnimationFrame()
            return () => {
                cancelAnimationFrame(animationFrameIdRef.current)
                niconicommentsRef.current = null
                if (pipVideoRef.current) pipVideoRef.current.srcObject = null
            }
        }
    }, [threads, enableCommentPiP, previewCommentItem, commentRenderFps, disableCommentOutline])
    useInterval(() => {
        if (!videoRef.current || !isCommentShown || !niconicommentsRef.current) return
        niconicommentsRef.current.drawCanvas(videoRef.current.currentTime * 100)
    }, Math.floor(1000 / commentRenderFps))
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

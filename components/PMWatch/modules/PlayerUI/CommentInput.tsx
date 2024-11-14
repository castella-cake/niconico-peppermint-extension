import { IconSend2 } from "@tabler/icons-react";
import { useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react"
import type { VideoDataRootObject } from "@/types/VideoData";
import type { CommentDataRootObject, CommentResponseRootObject, Thread } from "@/types/CommentData";
import { CommentPostBody, KeyRootObjectResponse } from "@/types/CommentPostData";
import { getCommentPostKey, getCommentThread, postComment } from "../../../../utils/watchApi";
//import { getCommentPostKey, postComment } from "../../../modules/watchApi";


type Props = {
    videoId: string,
    videoInfo: VideoDataRootObject,
    setCommentContent: Dispatch<SetStateAction<CommentDataRootObject>>,
    videoRef: RefObject<HTMLVideoElement>,
    commentInputRef: RefObject<HTMLInputElement>,
}



function CommentInput({videoRef, videoId, videoInfo, setCommentContent, commentInputRef}: Props) {
    const commandInput = useRef<HTMLInputElement>(null)

    const [isComposing, setIsComposing] = useState(false);
    const startComposition = () => setIsComposing(true);
    const endComposition = () => setIsComposing(false);

    // idが遅い方のmain
    const mainThreads = videoInfo.data?.response.comment.threads.filter(elem => elem.isDefaultPostTarget).sort((a, b) => Number(b.id) - Number(a.id))[0]

    async function sendComment(videoId: string, commentBody: string, commentCommand: string[] = [], vposMs: number) {
        // {"videoId":"","commands":["184"],"body":"君ビートマニア上手いねぇ！","vposMs":147327,"postKey":""}
        //console.log(mainThreads)
        const postKeyResponse: KeyRootObjectResponse = await getCommentPostKey(mainThreads?.id)
        if (postKeyResponse.meta.status !== 200) return 
        const reqBody: CommentPostBody = {videoId, commands: [...commentCommand, "184"], body: commentBody, vposMs, postKey: postKeyResponse.data.postKey}
        //console.log(reqBody)
        const commentPostResponse: CommentResponseRootObject = await postComment(mainThreads?.id, JSON.stringify(reqBody))
        //console.log(commentPostResponse)
        if ( commentPostResponse.meta.status === 201 && videoInfo.data ) {
            const commentRequestBody = {
                params: {
                    ...videoInfo.data?.response.comment.nvComment.params
                },
                threadKey: videoInfo.data?.response.comment.nvComment.threadKey
            }
            const commentResponse: CommentDataRootObject = await getCommentThread(videoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
            if (!commentResponse.data || !commentResponse.data.threads) return
            const newThreads: Thread[] = commentResponse.data.threads.map((thread: Thread, index) => {
                const newComments = thread.comments.map((comment, index) => {
                    if ( comment.id === commentPostResponse.data.id || comment.no === commentPostResponse.data.no ) {
                        comment.commands = [...comment.commands, "nico:waku:#ff0"]
                        return comment
                    } else if (comment.isMyPost) {
                        comment.commands = [...comment.commands, "nico:waku:#fb6"]
                        return comment
                    } else {
                        return comment
                    }
                })
                return {...thread, comments: newComments}
            })
            const commentDataResult: CommentDataRootObject = {
                meta: commentResponse.meta,
                data: {
                    ...commentResponse.data,
                    threads: newThreads
                }
            }
            setCommentContent(commentDataResult)
            // 今はただ要素が利用可能であることだけ伝えます
            document.dispatchEvent(new CustomEvent("pmw_commentDataUpdated", { detail: "" })) // JSON.stringify({commentContent: commentResponse})
        }
    }

    function onKeydown(keyName: string) {
        if ( keyName === "Enter" && commentInputRef.current && videoRef.current && !isComposing ) {
            sendComment(videoId, commentInputRef.current.value, commandInput.current?.value.split(""), Math.floor(videoRef.current.currentTime * 1000) )
            commentInputRef.current.value = ""
        }
    }
    
    return <div className="commentinput-container global-flex" id="pmw-commentinput">
        <input ref={commandInput} className="commentinput-cmdinput" placeholder="コマンド" />
        <input ref={commentInputRef} className="global-flex1 commentinput-input" placeholder="コメントを入力" onKeyDown={(e) => {onKeydown(e.key)}} onCompositionStart={startComposition} onCompositionEnd={endComposition}/>
        <button type="button" className="commentinput-submit" onClick={() => {
            if (!commentInputRef.current || !videoRef.current || commentInputRef.current.value === "") return
            sendComment(videoId, commentInputRef.current.value, commandInput.current?.value.split(" "), Math.floor(videoRef.current.currentTime * 1000) )
            commentInputRef.current.value = ""
        }}><IconSend2/><span>コメント</span></button>
    </div>
}


export default CommentInput;
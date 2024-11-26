import { IconSend2 } from "@tabler/icons-react";
import { useRef, useState } from "react";
import type { ChangeEvent, Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react"
import type { VideoDataRootObject } from "@/types/VideoData";
import type { Comment, CommentDataRootObject, CommentResponseRootObject, Thread } from "@/types/CommentData";
import { CommentPostBody, KeyRootObjectResponse } from "@/types/CommentPostData";
import { getCommentPostKey, postComment } from "../../../../utils/watchApi";
//import { getCommentPostKey, postComment } from "../../../modules/watchApi";


type Props = {
    videoId: string,
    videoInfo: VideoDataRootObject,
    setCommentContent: Dispatch<SetStateAction<CommentDataRootObject>>,
    reloadCommentContent: () => Promise<CommentDataRootObject | undefined>,
    videoRef: RefObject<HTMLVideoElement>,
    commentInputRef: RefObject<HTMLTextAreaElement>,
    setPreviewCommentItem: Dispatch<SetStateAction<Comment | null>>
}



function CommentInput({videoRef, videoId, videoInfo, setCommentContent, reloadCommentContent, commentInputRef, setPreviewCommentItem}: Props) {
    const { localStorage } = useStorageContext()
    const commandInput = useRef<HTMLInputElement>(null)

    const [dummyTextAreaContent, setDummyTextAreaContent] = useState("")
    const [isComposing, setIsComposing] = useState(false);
    const startComposition = () => setIsComposing(true);
    const endComposition = () => setIsComposing(false);

    // idが遅い方のデフォルトの投稿ターゲット
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
            const commentResponse = await reloadCommentContent()
            if (!commentResponse || !commentResponse.data || !commentResponse.data.threads) return
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
        if (commentBody === "＠ピザ" || commentBody === "@ピザ") {
            window.open("https://www.google.com/search?q=ピザ")
        }
        if (localStorage.playersettings.pauseOnCommentInput && videoRef.current) {
            videoRef.current.play()
        }
        setPreviewCommentItem(null)
        if (commentInputRef.current) commentInputRef.current.value = ""
        setDummyTextAreaContent("")
    }

    function onKeydown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.ctrlKey || e.altKey) return
        if ( !e.shiftKey && e.key === "Enter" && commentInputRef.current && videoRef.current && !isComposing ) {
            sendComment(videoId, commentInputRef.current.value, commandInput.current?.value.split(""), Math.floor(videoRef.current.currentTime * 1000) )
            commentInputRef.current.value = ""
            e.preventDefault()
        } else if (localStorage.playersettings.pauseOnCommentInput && videoRef.current ) {
            videoRef.current.pause()
        }
    }
    
    function onChange(event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) {
        if (commentInputRef.current) setDummyTextAreaContent(commentInputRef.current.value)
        if (localStorage.playersettings.pauseOnCommentInput && videoInfo.data && videoInfo.data.response.viewer && commentInputRef.current && commandInput.current && commentInputRef.current.value.length > 0 && videoRef.current) {
            setPreviewCommentItem({
                id: "-1", 
                no: -1,
                vposMs: Math.floor(videoRef.current.currentTime * 1000),
                body: commentInputRef.current.value,
                commands: ["184", "nico:waku:#faf", ...commandInput.current.value.split(" ")],
                isMyPost: true,
                userId: "-1",
                isPremium: videoInfo.data?.response.viewer?.isPremium,
                score: 0,
                postedAt: new Date().toString(),
                nicoruCount: 0,
                nicoruId: null,
                source: ""
            })
        } else setPreviewCommentItem(null)
    }

    // textarea 周りの挙動は https://qiita.com/tsmd/items/fce7bf1f65f03239eef0 を参考にさせていただきました
    return <div className="commentinput-container global-flex" id="pmw-commentinput">
        <input ref={commandInput} className="commentinput-cmdinput" placeholder="コマンド" onChange={onChange} />
        <div className="commentinput-textarea-container global-flex1">
            <div className="commentinput-textarea-dummy" aria-hidden="true">{dummyTextAreaContent + '\u200b'}</div>
            <textarea ref={commentInputRef} className="commentinput-input" placeholder="コメントを入力" onKeyDown={onKeydown} onChange={onChange} onCompositionStart={startComposition} onCompositionEnd={endComposition}/>
        </div>
        <button type="button" className="commentinput-submit" onClick={() => {
            if (!commentInputRef.current || !videoRef.current || commentInputRef.current.value === "") return
            sendComment(videoId, commentInputRef.current.value, commandInput.current?.value.split(" "), Math.floor(videoRef.current.currentTime * 1000) )
        }}><IconSend2/><span>コメント</span></button>
    </div>
}


export default CommentInput;
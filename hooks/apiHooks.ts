import { useEffect, useState } from "react"
import type { VideoDataRootObject } from "@/types/VideoData"
import { getCommentThread, getRecommend, getVideoInfo } from "../utils/watchApi"
import { CommentDataRootObject } from "@/types/CommentData"
import { RecommendDataRootObject } from "@/types/RecommendData"

export function useWatchData(smId: string) {
    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
    const commentThreadKeyRef = useRef("")
    const [errorInfo, setErrorInfo] = useState<any>(false)
    useEffect(() => {
        async function fetchInfo() {
            try {
                // metaタグからのレスポンスを入れる。ないかもしれないので最初はnull。
                let initialResponse: VideoDataRootObject | null = null
                let fetchedVideoInfo: VideoDataRootObject | null = null
                if (
                    document.getElementsByName('initial-response').length > 0 && 
                    typeof document.getElementsByName('initial-response')[0].getAttribute('content') === "string"
                ) {
                    initialResponse = JSON.parse(document.getElementsByName('initial-response')[0].getAttribute('content')!) as VideoDataRootObject
                }
                // HTMlのレスポンスが今フェッチしようとしているvideoのidと同じならこっちを使う
                if (initialResponse && initialResponse.meta?.status === 200 && initialResponse.data?.response.video.id === smId) {
                    fetchedVideoInfo = initialResponse
                    document.getElementsByName('initial-response')[0].remove() // 使いまわすべきではないので削除。Reactの思想(一貫性)に反するがこうするしかない。
                    //console.log("using initialResponse")
                } else fetchedVideoInfo = await getVideoInfo(smId)
                if (!fetchedVideoInfo || !fetchedVideoInfo.data) return
                setVideoInfo(fetchedVideoInfo)
                setErrorInfo(false)
                const commentRequestBody = {
                    params: {
                        ...fetchedVideoInfo.data.response.comment.nvComment.params
                    },
                    threadKey: fetchedVideoInfo.data.response.comment.nvComment.threadKey
                }
                const commentResponse: CommentDataRootObject = await getCommentThread(fetchedVideoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
                setCommentContent(commentResponse)
                commentThreadKeyRef.current = fetchedVideoInfo.data.response.comment.nvComment.threadKey
            } catch (error) {
                console.error(error)
                setErrorInfo(error)
            }
        }
        fetchInfo()
    }, [smId])
    async function reloadCommentContent() {
        if (!videoInfo.data) return
        const commentRequestBody = {
            params: {
                ...videoInfo.data.response.comment.nvComment.params
            },
            threadKey: commentThreadKeyRef.current
        }
        let commentResponse: CommentDataRootObject = await getCommentThread(videoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
        if (!commentResponse.data || !commentResponse.data.threads) {
            if (commentResponse.meta?.errorCode === "EXPIRED_TOKEN") {
                console.log("PMW: getCommentThread failed with expired token, fetching token...")
                const threadKeyResponse: { meta?: { status: number }, data?: { threadKey: string } } = await getCommentThreadKey(videoInfo.data.response.video.id)
                if (threadKeyResponse.meta && threadKeyResponse.meta.status === 200 && threadKeyResponse.data?.threadKey) {
                    commentThreadKeyRef.current = threadKeyResponse.data.threadKey
                    const newCommentRequestBody = {
                        params: {
                            ...videoInfo.data.response.comment.nvComment.params
                        },
                        threadKey: commentThreadKeyRef.current
                    }
                    commentResponse = await getCommentThread(videoInfo.data.response.comment.nvComment.server, JSON.stringify(newCommentRequestBody))
                    if (!commentResponse.data || !commentResponse.data.threads) {
                        console.error("PMW: getCommentThread failed. (1 threadKey retry)")
                        return
                    }
                } else {
                    console.error("PMW: fetching threadKey failed.")
                    return
                }
            }
        }
        setCommentContent(commentResponse)
        return commentResponse
    }
    return { videoInfo, commentContent, setCommentContent, reloadCommentContent, errorInfo }
}

export function useRecommendData(smId: string) {
    const [ recommendData, setRecommendData ] = useState<RecommendDataRootObject>({})
    useEffect(() => {
        async function fetchInfo() {
            const recommendResponse = await getRecommend(smId)
            setRecommendData(recommendResponse)
            //console.log(commentResponse)
        }
        fetchInfo()
    }, [smId])
    return recommendData
}
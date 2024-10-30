import { useEffect, useState } from "react"
import type { VideoDataRootObject } from "../../../types/VideoData"
import { getCommentThread, getRecommend, getVideoInfo } from "../../../modules/watchApi"
import { CommentDataRootObject } from "../../../types/CommentData"
import { RecommendDataRootObject } from "../../../types/RecommendData"

export function useWatchData(smId: string) {
    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
    const [errorInfo, setErrorInfo] = useState<any>(false)
    useEffect(() => {
        async function fetchInfo() {
            try {
                const fetchedVideoInfo: VideoDataRootObject = await getVideoInfo(smId)
                setVideoInfo(fetchedVideoInfo)
                if (!fetchedVideoInfo.data) return
                setErrorInfo(false)
                const commentRequestBody = {
                    params: {
                        ...fetchedVideoInfo.data.response.comment.nvComment.params
                    },
                    threadKey: fetchedVideoInfo.data.response.comment.nvComment.threadKey
                }
                const commentResponse: CommentDataRootObject = await getCommentThread(fetchedVideoInfo.data.response.comment.nvComment.server, JSON.stringify(commentRequestBody))
                setCommentContent(commentResponse)
            } catch (error) {
                console.error(error)
                setErrorInfo(error)
            }
        }
        fetchInfo()
    }, [smId])
    return { videoInfo, commentContent, setCommentContent, errorInfo }
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
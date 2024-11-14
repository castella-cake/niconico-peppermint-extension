import { useEffect, useState } from "react"
import type { VideoDataRootObject } from "@/types/VideoData"
import { getCommentThread, getRecommend, getVideoInfo } from "../utils/watchApi"
import { CommentDataRootObject } from "@/types/CommentData"
import { RecommendDataRootObject } from "@/types/RecommendData"

export function useWatchData(smId: string) {
    const [videoInfo, setVideoInfo] = useState<VideoDataRootObject>({})
    const [commentContent, setCommentContent] = useState<CommentDataRootObject>({})
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
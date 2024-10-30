import { Dispatch, PointerEvent, RefObject, SetStateAction, useMemo } from "react";
import { secondsToTime } from "../commonFunction";

import type { CommentDataRootObject, Comment as CommentItem} from "@/types/CommentData";

type Props = {
    currentTime: number,
    duration: number,
    showTime: boolean,
    tempSeekDuration: number,
    bufferedDuration: number,
    isSeeking: boolean,
    setIsSeeking: Dispatch<SetStateAction<boolean>>,
    tempSeekHandle: (clientX: number) => void,
    commentContent: CommentDataRootObject,
    seekbarRef: RefObject<HTMLDivElement>,
}

export function Seekbar({ currentTime, duration, showTime, bufferedDuration, setIsSeeking, tempSeekHandle, commentContent, seekbarRef}: Props) {
    const commentStatsCalc = useMemo(() => {
        const comments = commentContent.data?.threads
            .map(elem => elem.comments)
            .reduce((prev, current) => {
                return prev.concat(current)
            }, [] as CommentItem[])
            .sort((a, b) => a.vposMs - b.vposMs)
        let commentStats: { [key: string]: number } = {}
        if (!comments) return {}
        // 大体要素数が60くらいになるように
        const splitSeconds = duration / 60
        const setMax = 50
        let maxLength = -1

        for (let i = 0; i < (Math.floor(duration) / splitSeconds); i++) {
            // 前の範囲以上、今の範囲内のvposMsでフィルターして数を記録
            const thisLength = comments.filter(elem => elem.vposMs < (i + 1) * (splitSeconds * 1000) && elem.vposMs > i * (splitSeconds * 1000)).length
            commentStats[i * splitSeconds] = thisLength
            // 最高値なら代入
            if ( maxLength < thisLength ) maxLength = thisLength
        }
        // maxLength は setMax の何倍か
        const lengthScale = maxLength / setMax
        // lengthScaleの値で commentStats をスケール
        for (const key in commentStats) {
            commentStats[key] = Math.floor(commentStats[key] / lengthScale)
        }
        return commentStats
    }, [commentContent, duration])

    function onPointerDown(e: PointerEvent) {
        setIsSeeking(true);
        tempSeekHandle(e.clientX);
        e.preventDefault();
        e.stopPropagation()
    }

    return <div className="seekbar-container" id="pmw-seekbar">
        { showTime && <div className="seekbar-time currenttime">{secondsToTime( currentTime )}</div> }
        <div className="seekbar" ref={seekbarRef} onDragOver={(e) => {e.preventDefault()}}
            onPointerDown={onPointerDown}
        >
            <div className="seekbar-commentstats global-flex">{Object.keys(commentStatsCalc).map((keyname, index) => {
                return <span key={`${keyname}s-index`} className="global-flex1" style={{["--height" as any]: `${commentStatsCalc[keyname]}px`}}></span>
            })}</div>
            <div className="seekbar-buffered" style={{ width: `${bufferedDuration / duration * 100}%` }}></div>
            <div className="seekbar-played" style={{ width: `${( currentTime ) / duration * 100}%` }}></div>
            <div className="seekbar-thumb" style={{ left: `${( currentTime ) / duration * 100}%` }}></div>
        </div>
        { showTime && <div className="seekbar-time duration">{secondsToTime(duration)}</div> }
    </div>
}
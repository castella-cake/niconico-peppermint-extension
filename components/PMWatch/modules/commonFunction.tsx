import { Thread, Comment } from "@/types/CommentData"
import { ViewerNg } from "@/types/VideoData"

export function secondsToTime(seconds: number) {
    const second = Math.floor(seconds % 60)
    const minute = Math.floor((seconds / 60) % 60)
    const hour = Math.floor((seconds / 60) / 60)

    let ss = `${second}`
    let mm = `${minute}`
    let hh = `${hour}`
    
    if (second < 10) ss = `0${ss}`
    if (minute < 10) mm = `0${mm}`

    if (hour < 1) return `${mm}:${ss}`

    if (hour < 10) hh = `0${hh}`
    return `${hh}:${mm}:${ss}`
}

export function timeCalc(operation: string, time: number, currentTime: number, duration: number) {
    // 不要かもしれないが、一応合計時間超過/0未満をハンドルする
    if ( operation == "add" && currentTime + time < 0 ) {
        // 足した結果が0未満
        return 0
    } else if ( operation == "add" && currentTime + time < duration ) {
        // 足した結果が合計時間を超えない
        return time + currentTime
    } else if ( operation == "add" && currentTime + time > duration ) {
        // 足した結果が合計時間を超える
        return duration
    } else if ( operation == "set" && time >= 0 ){
        // 三項演算子 指定された時間が合計時間を超えるなら合計時間に
        return ( time > duration ? duration : time )
    } else if ( operation == "set" && time < 0 ){
        // 指定された時間が0未満
        return 0
    } else {
        throw new Error("Operation not found")
    }
}

export const handleCtrl = (e: KeyboardEvent, video: HTMLVideoElement | null, commentInput: HTMLTextAreaElement | null, onToggleFullscreen: () => void) => {
    if ( e.ctrlKey ) return true;
    if ( e.target instanceof Element ) {
        if ( e.target.closest("input, textarea") ) return true;
    }
    if ( (e.key === " " || e.key === "　") && video ) {
        e.preventDefault()
        if ( video.paused ) {
            video.play()
        } else {
            video.pause()
        }
        return false;
    }
    if ( e.key === "ArrowLeft" && video ) {
        e.preventDefault()
        video.currentTime = timeCalc("add", -10, video.currentTime, video.duration)
        return false;
    }
    if ( e.key === "ArrowRight" && video ) {
        e.preventDefault()
        video.currentTime = timeCalc("add", 10, video.currentTime, video.duration)
        return false;
    }
    if ( e.key === "," && video ) {
        e.preventDefault()
        video.currentTime = timeCalc("add", -1 / 60, video.currentTime, video.duration)
        return false;
    }
    if ( e.key === "." && video ) {
        e.preventDefault()
        video.currentTime = timeCalc("add", 1 / 60, video.currentTime, video.duration)
        return false;
    }
    if ( e.key === "c" || e.key === "C" ) {
        if (!commentInput) return
        // 入力を防ぐために preventDefaultしてからフォーカス(後でreturnしたら間に合わない)
        e.preventDefault()
        commentInput.focus()
        return false;
    }
    if ( e.key === "f" || e.key === "F" ) {
        onToggleFullscreen()
        return false;
    }
}

export function readableInt(number: number) {
    const units = ["万","億","兆","京","垓","秭","穣","溝","潤","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"]
    if ( number.toString().indexOf("e") == -1 ) {
        const stringArray = number.toString().split("").reverse()
        const length = Math.ceil(stringArray.length / 4)
        const splitArray = new Array(length).fill("").map((_, index) => stringArray.slice(index * 4, (index + 1) * 4))
        const afterStringArray = splitArray.map((chars, index) => {
            if (chars.length === 4 && index + 1 !== length) {
                return [...chars, units[index]]
            } else {
                return chars
            }
        })
        /*const afterStringArray = stringArray.map((char, index) => {
            if ((index) % 4 !== 0) return char
            return `${char}${units[((index) / 4) - 1] || ""}`
        })*/
        return afterStringArray.reduce((prev,current) => prev.concat(current), []).reverse().join("")
    } else {
        return number
    }
}

// https://dic.nicovideo.jp/a/ng%E5%85%B1%E6%9C%89%E6%A9%9F%E8%83%BD より。
// noneは-100万を超えるNGスコアを持つコメントがない前提でやってる…ないよな？
export const sharedNgLevelScore = {
    "low": -10000,
    "mid": -4800,
    "high": -1000,
    "none": -1000000,
}

export function doFilterThreads(threads: Thread[], sharedNgLevel: number, viewerNg?: ViewerNg ) {
    const threadsAfter = threads.map((thread) => {
        if ( thread.fork === "owner" ) return thread
        const comments = doFilterComments(thread.comments, sharedNgLevel, viewerNg)
        return { ...thread, comments }
    })
    return threadsAfter
}

export function doFilterComments(comments: Comment[], sharedNgLevel: number, viewerNg?: ViewerNg) {
    return comments.filter((comment) => {
        if ( comment.score < sharedNgLevel ) return false
        if (viewerNg && viewerNg.items.findIndex(elem => {
            if (elem.type === "command" && comment.commands.findIndex(command => elem.source === command) !== -1) return true
            if (elem.type === "id" && comment.userId === elem.source) return true
            if (elem.type === "word" && comment.body.includes(elem.source)) return true
            return false
        }) !== -1) return false
        return true
    })
}


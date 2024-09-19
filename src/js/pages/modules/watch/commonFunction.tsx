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

export const handleCtrl = (e: KeyboardEvent, video: HTMLVideoElement | null, commentInput: HTMLInputElement | null, onToggleFullscreen: () => void) => {
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
        const afterStringArray = stringArray.map((char, index) => {
            if ((index) % 4 !== 0) return char
            return `${char}${units[((index) / 4) - 1] || ""}`
        })
        return afterStringArray.reverse().join("")
    } else {
        return number
    }
}
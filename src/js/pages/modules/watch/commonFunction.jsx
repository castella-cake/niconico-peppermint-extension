export function secondsToTime(seconds) {
    let ss = Math.floor(seconds % 60)
    let mm = Math.floor((seconds / 60) % 60)
    let hh = Math.floor((seconds / 60) / 60)

    if (ss < 10) ss = `0${ss}`
    if (mm < 10) mm = `0${mm}`

    if (hh < 1) return `${mm}:${ss}`

    if (hh < 10) hh = `0${hh}`
    return `${hh}:${mm}:${ss}`
}
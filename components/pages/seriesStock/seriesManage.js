import { useEffect, useState } from "react"


// syncStorageの取得が不明な理由によりできないので未使用です。ここにあるものは使われるコンポーネントにそのままあります。
export async function addToFolder(folderId, seriesId, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
        const index = syncStorage.stockedseries.findIndex(elem => elem.id === folderId)
        if ( syncStorage.stockedseries[index].idList.includes(seriesId) ) return

        const stockArrayCopy = syncStorage.stockedseries.slice()
        stockArrayCopy[index].idList.push(seriesId)
        callback("stockedseries", stockArrayCopy)
    }
}
export async function removeSeriesStock(seriesid, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(series => series.seriesID === seriesid) != -1) {
        const newStock = syncStorage.stockedseries.filter(obj => obj.seriesID !== seriesid);
        callback("stockedseries", newStock)
    }
}

export function addFolder(name, idList = [], callback) {
    const addAfter = syncStorage.stockedseries.slice()
    addAfter.unshift({type: "folder", name: ( (name != "" && name) ? name : "名称未設定のフォルダー"), id: crypto.randomUUID(), idList: idList})
    callback("stockedseries", addAfter)
}

export async function removeFolder(folderId, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
        const newStock = syncStorage.stockedseries.filter(obj => obj.id !== folderId);
        callback("stockedseries", newStock)
    }
}
export async function removeFromFolder(folderId, index, seriesId, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if ( syncStorage.stockedseries[index] && syncStorage.stockedseries[index].type == "folder" && syncStorage.stockedseries[index].id == folderId ) {
        const stockArrayCopy = syncStorage.stockedseries.slice()
        stockArrayCopy[index].idList = stockArrayCopy[index].idList.filter(elem => elem !== seriesId)
        callback("stockedseries", stockArrayCopy)
    }
}
export async function setFolder(folderId, index, obj, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if ( syncStorage.stockedseries[index] && syncStorage.stockedseries[index].type == "folder" && syncStorage.stockedseries[index].id == folderId ) {
        const stockArrayCopy = syncStorage.stockedseries.slice()
        stockArrayCopy[index] = obj
        callback("stockedseries", stockArrayCopy)
    }
}
export async function addSeriesStock(seriesId, seriesName, callback) {
    const syncStorage = await browser.storage.sync.get(null)
    if ( syncStorage.stockedseries ) {
        callback("stockedseries", [{ seriesID: seriesId, seriesName: seriesName }, ...syncStorage.stockedseries])
    }
}

// ここは使用中。消すな
export async function getSeriesInfo(id) {
    return new Promise((resolve, reject) => {
        try {
            browser.runtime.sendMessage({ "type": "getSeriesInfo", "seriesID": id }, resolve)
        } catch (err) {
            reject(err)
        }
    })
}

export function useSeriesInfo(id) {
    const [thisSeriesInfo, setThisSeriesInfo] = useState(null)
    useEffect(() => {
        async function getData() {
            setThisSeriesInfo(await getSeriesInfo(id))
        }
        getData()
    }, [])
    return thisSeriesInfo
}
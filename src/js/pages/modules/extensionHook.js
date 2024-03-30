import { useState, useEffect, useContext, createContext } from "react";

async function getSyncStorageData() {
    return await new Promise((resolve) => chrome.storage.sync.get(null, resolve))
}
async function getLocalStorageData() {
    return await new Promise((resolve) => chrome.storage.local.get(null, resolve))
}

export function useSyncStorage() {
    const [ syncStorage, _setSyncStorageVar ] = useState({})
    function setSyncStorageValue(name, value) {
        _setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }
    useEffect(() => {
        async function setStorage() {
            _setSyncStorageVar(await getSyncStorageData())
        } 
        setStorage()
    }, [])
    return [syncStorage, setSyncStorageValue]
}

export function useLocalStorage() {
    const [ localStorage, _setLocalStorageVar ] = useState({})
    function setLocalStorageValue(name, value) {
        _setLocalStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.local.set({ [name]: value })
    }
    useEffect(() => {
        async function setStorage() {
            _setLocalStorageVar(await getLocalStorageData())
        } 
        setStorage()
    }, [])
    return [localStorage, setLocalStorageValue]
}

export function useManifestData() {
    return chrome.runtime.getManifest()
}

export function useStorage() {
    const [ storages, _setStorageVar ] = useState({ local: {}, sync: {} })
    function setLocalStorageValue(name, value) {
        _setStorageVar(current => {
            return {
                ...current,
                local: {
                    ...current.local,
                    [name]: value 
                }
            }
        })
        chrome.storage.local.set({ [name]: value })
    }
    function setSyncStorageValue(name, value) {
        _setStorageVar(current => {
            return {
                ...current,
                sync: {
                    ...current.sync,
                    [name]: value 
                }
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }
    useEffect(() => {
        async function setStorage() {
            const localStorage = await getLocalStorageData()
            const syncStorage = await getSyncStorageData()
            _setStorageVar({ local: localStorage, sync: syncStorage })
        } 
        setStorage()
    }, [])
    return [storages, setLocalStorageValue, setSyncStorageValue]
}

const IStorageContext = createContext()

export function StorageProvider({ children }) {
    const [storages, setLocalStorageValue, setSyncStorageValue] = useStorage()
    return (<IStorageContext.Provider value={{ syncStorage: storages.sync, setSyncStorageValue, localStorage: storages.local, setLocalStorageValue }}>
        {children}
    </IStorageContext.Provider>)
}

export function useStorageContext() {
    return useContext(IStorageContext)
}
import { useState, useEffect, useContext, createContext } from "react";
import { getSyncStorageData, getLocalStorageData } from "../../modules/storageControl";

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
            _setSyncStorageVar(await getSyncStorageData)
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
            _setLocalStorageVar(await getLocalStorageData)
        } 
        setStorage()
    }, [])
    return [localStorage, setLocalStorageValue]
}

export function useManifestData() {
    const [ manifestData, _setManifestDataVar ] = useState(null)
    useEffect(() => {
        _setManifestDataVar(chrome.runtime.getManifest());
    }, [])
    return manifestData
}

const ISyncStorageContext = createContext()

export function SyncStorageProvider({ children }) {
    const [ syncStorage, setSyncStorageValue ] = useSyncStorage()
    return (<ISyncStorageContext.Provider value={{ syncStorage, setSyncStorageValue }}>
        {children}
    </ISyncStorageContext.Provider>)
}

export function useSyncStorageContext() {
    return useContext(ISyncStorageContext)
}
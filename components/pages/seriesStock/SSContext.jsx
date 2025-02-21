import { useState, useContext, createContext } from "react";
import { useSyncStorage } from "@/hooks/extensionHook";
import { useLang } from "@/hooks/localizeHook"

const ISSContext = createContext()

export function useSSContext() {
    return useContext(ISSContext)
}

export function SSProvider({ children }) {
    const lang = useLang()
    const [ syncStorage, setSyncStorageValue ] = useSyncStorage()
    const [isUnlocked, setIsUnlockedVar] = useState(false)
    const [isFolderCreateWindow, setIsFolderCreateWindowVar] = useState(false)
    const [fcDefaultSelected, setFCDefaultSelected] = useState([]);
    const [fcEditId, setFCEditId] = useState(null)

    return <ISSContext.Provider value={{
        syncStorage, setSyncStorageValue, 
        fcDefaultSelected, setFCDefaultSelected, 
        fcEditId, setFCEditId, 
        isUnlocked, setIsUnlockedVar,
        isFolderCreateWindow, setIsFolderCreateWindowVar, 
        lang,
    }}>
        {children}
    </ISSContext.Provider>
}


const { useState, useContext, createContext } = require("react");
const { useSyncStorage } = require("../extensionHook");
const { useLang } = require("../localizeHook");

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


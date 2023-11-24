import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSyncStorageData } from "./modules/storageControl";
import CreateSettingsList from "./modules/pages/SettingsList";

function StorageTest() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    useEffect(() => {
        console.log("useEffect called")
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])
    return <div>{ JSON.stringify(syncStorage) }</div>
}


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <h1>Hello React from JSX!</h1>
        <StorageTest/>
        <CreateSettingsList/>
    </React.StrictMode>,
);
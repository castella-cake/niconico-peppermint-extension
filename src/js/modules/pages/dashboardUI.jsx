import React, { useState, useEffect } from "react";
import { getSyncStorageData } from "../storageControl";
import CreateSeriesStockBlock from "./seriesStock";
import lang from "../../../langs/ja.json";
import CreateQuickOption from "./QuickOptions";

function CreateDashboardUI() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    useEffect(() => {
        console.log("useEffect called")
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])

    const [isEditMode, setIsEditMode] = useState(false)

    return <>
        <CreateQuickOption/>
        <CreateSeriesStockBlock />
    </>
}

export default CreateDashboardUI;
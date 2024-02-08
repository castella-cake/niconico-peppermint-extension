import React, { useState, useEffect } from "react";
import { getSyncStorageData } from "../storageControl";
import CreateSeriesStockBlock from "./seriesStock";
import lang from "../../../langs/ja.json";
import CreateQuickOption from "./QuickOptions";

import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';

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

    return <div className={isEditMode ? "dashboard-container db-unlocked" : "dashboard-container"}>
        <CreateQuickOption/>
        <CreateSeriesStockBlock />
        <button type="button" className="dashboard-editbutton" onClick={() => {setIsEditMode(!isEditMode)}}>{isEditMode ? <><DoneIcon/> 編集を終了</> : <><EditIcon/> ダッシュボードを編集</>}</button>
    </div>
}

export default CreateDashboardUI;
import React, { useEffect, useState } from "react";
import { getSyncStorageData } from "../storageControl";
import settings from "./settingsList";
import lang from "../../../langs/ja.json";
import "../../../style/pages/settingsUI.styl"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";

import Edit from "@mui/icons-material/Edit";
import EditOff from "@mui/icons-material/EditOff";
import Delete from "@mui/icons-material/Delete";

function CreateQuickOption() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    const [ isEditMode, setIsEditMode ] = useState(false)

    useEffect(() => {
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])
    const settingsObj = {}
    Object.keys(settings).map((elem) => {
        settings[elem].map((settingsElem) => {
            settingsObj[settingsElem.name] = settingsElem;
        })
    })

    const settingsFilter = ( syncStorage.quickoptionlist ? syncStorage.quickoptionlist : ["playertheme", "darkmode"] )

    // #region dnd define
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    function handleDragEnd(e) {
        const {active, over} = e;
        if (active.id !== over.id) {
            const oldIndex = settingsFilter.indexOf(active.id);
            const newIndex = settingsFilter.indexOf(over.id);
            const sortAfterList = arrayMove(settingsFilter, oldIndex, newIndex);
            setSyncStorageValue("quickoptionlist", sortAfterList)
        }
    }
    // #endregion
    
    function setSyncStorageValue(name, value) {
        setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }

    function removeQuickOptionList(name) {
        setSyncStorageValue("quickoptionlist", settingsFilter.filter(elem => { return elem != name }))
    }

    function CreateSettingsControl(props) {
        //console.log(lang.SETTINGS_ITEMS[settings.name].name)
        const settings = props.settings
        if ( isEditMode ) {
            return <div className="quickoptions-editmode-row">{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<button className="quickoption-editmode-remove" type="button" onClick={() => {removeQuickOptionList(settings.name)}}><Delete style={{fontSize: 16}}/></button></div>
        }
        if ( settings.type == "checkbox" ) {
            return <label key={settings.name}><input type="checkbox" checked={syncStorage[settings.name] ?? settings.default} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.checked)}} />{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label>
        } else if ( settings.type == "select" ){
            const settingsOption = settings.values.map((elem, index) => { return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</option> })
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<select onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}} value={syncStorage[settings.name] ?? settings.default}>{ settingsOption }</select></label>
        } else if ( settings.type == "selectButtons" ){
            const settingsOption = settings.values.map((elem, index) => { return <button type="button" key={elem} onClick={() => {setSyncStorageValue(settings.name, elem)}} className={"select-button" + ((syncStorage[settings.name] ?? settings.default) == elem ? " select-button-current" : "")}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</button> })
            return <><label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label><div className="select-button-container" key={`${settings.name}-selectbutton`}>{ settingsOption }</div></>
        } else if ( settings.type == "inputNumber" ) {
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="number" min={settings.min} max={settings.max} value={(syncStorage[settings.name] ?? settings.default)} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}}/></label>
        } else if ( settings.type == "inputString" ) {
            //console.log(syncStorage[settings.name])
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<input type="text" value={(syncStorage[settings.name] ?? settings.default)} placeholder={lang.SETTINGS_ITEMS[settings.name].placeholder ?? (settings.placeholder ?? null)} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}}/></label>
        } else {
            return <label key={settings.name}>Unknown settings type</label>
        }
    }
    function createSettingsRow(settings) {

        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: settings.name, disabled: !isEditMode})
        const dndStyle = { transform: CSS.Translate.toString(transform), transition, }

        return <div className="settings-row settings-row-qo" key={`${settings.name}-row`} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}><CreateSettingsControl settings={settings}/></div>
    }
    // functionにしないとなぜかDNDが機能しない
    function SettingsList() {
        return settingsFilter.map(elem => {return createSettingsRow(settingsObj[elem])})
    }

    function onAddSelectChanged(e) {
        settingsFilter.push(e.currentTarget.value)
        setSyncStorageValue("quickoptionlist", settingsFilter)
    }

    //console.log(elemArray)
    return <div className="block-container">
        <h2 className="block-title">クイックオプション<button title={isEditMode ? "クイック設定の編集を終了" : "クイック設定の項目を編集"} className="block-title-actionbutton" type="button" onClick={() => {setIsEditMode(!isEditMode)}}>{ isEditMode ? <EditOff style={{fontSize: 22}}/> : <Edit style={{fontSize: 22}}/>}</button><a href="settings.html" target="_self" style={{ "marginLeft": "1rem" }}>設定ページを開く</a></h2>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={settingsFilter}
                strategy={rectSortingStrategy}
            >
                <div className="quickoptions-settings-container">
                    <SettingsList />
                </div>
            </SortableContext>
        </DndContext>
        {isEditMode && <div>項目を追加 <select onChange={onAddSelectChanged}>{Object.keys(settingsObj).filter(elem => {return !settingsFilter.includes(elem)}).map((elem) => { return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[elem].name ?? elem}</option> })}</select></div>}
    </div>
}


export default CreateQuickOption;
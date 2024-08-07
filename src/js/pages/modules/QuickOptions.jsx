import { useRef, useState } from "react";
import settings from "./settingsList";
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
import { useStorageContext, useSyncStorage } from "./extensionHook";

//import { EditOutlined, EditOffOutlined, DeleteOutlined } from "@mui/icons-material";
import { MdOutlineEdit, MdOutlineEditOff, MdDeleteOutline} from "react-icons/md"
import { useLang } from "./localizeHook";

function CreateQuickOption() {
    const lang = useLang()
    const [ syncStorage, setSyncStorageValue ] = useSyncStorage()
    const [ isEditMode, setIsEditMode ] = useState(false)
    const settingsObj = {}
    Object.keys(settings).map((elem) => {
        settings[elem].map((settingsElem) => {
            if ( settingsElem.type === "desc" ) return;
            settingsObj[settingsElem.name] = settingsElem;
        })
    })

    const settingsFilter = ( syncStorage.quickoptionlist ? syncStorage.quickoptionlist : ["darkmode"] )

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

    function removeQuickOptionList(name) {
        setSyncStorageValue("quickoptionlist", settingsFilter.filter(elem => { return elem != name }))
    }

    function CreateSettingsControl(props) {
        //console.log(lang.SETTINGS_ITEMS[settings.name].name)
        const settings = props.settings
        if ( !settings || settings.type === "desc" ) return
        if ( isEditMode ) {
            return <div className="quickoptions-editmode-row" key={settings.name + "-edit"}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<button className="quickoption-editmode-remove" type="button" title={lang.REMOVE} onClick={() => {removeQuickOptionList(settings.name)}}><MdDeleteOutline style={{fontSize: 16}}/></button></div>
        }
        if ( settings.type == "checkbox" ) {
            return <label key={settings.name}><input type="checkbox" checked={syncStorage[settings.name] ?? settings.default} onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.checked)}} />{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}</label>
        } else if ( settings.type == "select" ){
            const settingsOption = settings.values.map((elem, index) => { return <option value={elem} key={settings.name + "-option-" + elem}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</option> })
            return <label key={settings.name}>{lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}<select onChange={(e) => {setSyncStorageValue(settings.name, e.currentTarget.value)}} value={syncStorage[settings.name] ?? settings.default}>{ settingsOption }</select></label>
        } else if ( settings.type == "selectButtons" ){
            const settingsOption = settings.values.map((elem, index) => { return <button type="button" key={settings.name + "-optionbutton-" + elem} onClick={() => {setSyncStorageValue(settings.name, elem)}} className={"select-button" + ((syncStorage[settings.name] ?? settings.default) == elem ? " select-button-current" : "")}>{lang.SETTINGS_ITEMS[settings.name].select[index] ?? elem}</button> })
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
        if ( !settings || settings.type == "desc" ) return
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: settings.name, disabled: !isEditMode})
        const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
        return <div className="settings-row settings-row-qo" key={`${settings.name}-row`} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}><CreateSettingsControl settings={settings}/></div>
    }
    // functionにしないとなぜかDNDが機能しない
    function SettingsList() {
        return settingsFilter.map(elem => {return createSettingsRow(settingsObj[elem])})
    }

    const selectRef = useRef(null)
    function onAddButtonClicked() {
        settingsFilter.push(selectRef.current.value)
        setSyncStorageValue("quickoptionlist", settingsFilter)
    }

    //console.log(elemArray)
    return <div className="block-container">
        <h2 className="block-title">{lang.DASHBOARD_TITLES.quickoption}<button title={isEditMode ? lang.QUICKOPTION_EDITOFF : lang.QUICKOPTION_EDIT} className="block-title-actionbutton" type="button" onClick={() => {setIsEditMode(!isEditMode)}}>{ isEditMode ? <MdOutlineEditOff style={{fontSize: 20}}/> : <MdOutlineEdit style={{fontSize: 20}}/>}</button><a href="settings.html" target="_self" className="block-title-primary-link">{lang.OPEN_SETTINGS_PAGE}</a></h2>
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
        {isEditMode && <div>{lang.ADD_ITEM} 
            <select ref={selectRef}>
                {Object.keys(settingsObj).filter(elem => {return !settingsFilter.includes(elem)}).map((elem) => {
                    return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[elem].name ?? elem}</option>
                })}
            </select>
            <button onClick={onAddButtonClicked} class="quickoption-button-add">{lang.ADD}</button></div>}
    </div>
}


export default CreateQuickOption;
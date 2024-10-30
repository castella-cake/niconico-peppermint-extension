import { useRef, useState } from "react";
import settings from "@/utils/settingsList";
import "@/entrypoints/settings/settingsUI.styl"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { useSyncStorage } from "@/hooks/extensionHook";

//import { EditOutlined, EditOffOutlined, DeleteOutlined } from "@mui/icons-material";
import { MdOutlineEdit, MdOutlineEditOff, MdDeleteOutline} from "react-icons/md"
import { useLang } from "@/hooks/localizeHook";

type setting = {
    type: string,
    name: string,
    values?: any[],
    default: any,
    min?: number,
    max?: number,
    placeholder?: string,
}

function CreateSettingsControl({ setting, isEditMode }: { setting: setting, isEditMode: boolean }) {
    //console.log(lang.SETTINGS_ITEMS[settings.name].name)
    const lang:any = useLang()
    const [ syncStorage, setSyncStorageValue ]: any = useSyncStorage()

    function removeQuickOptionList(name: string) {
        const settingsFilter = ( syncStorage.quickoptionlist ? syncStorage.quickoptionlist : ["darkmode"] )
        setSyncStorageValue("quickoptionlist", settingsFilter.filter((elem: any) => { return elem != name }))
    }
    
    if ( !setting || setting.type === "desc" ) return
    if ( isEditMode ) {
        return <div className="quickoptions-editmode-row" key={setting.name + "-edit"}>{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}<button className="quickoption-editmode-remove" type="button" title={lang.REMOVE} onClick={() => {removeQuickOptionList(setting.name)}}><MdDeleteOutline style={{fontSize: 16}}/></button></div>
    }
    if ( setting.type == "checkbox" ) {
        return <label key={setting.name}><input type="checkbox" checked={syncStorage[setting.name] ?? setting.default} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.checked)}} />{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}</label>
    } else if ( setting.type == "select" && setting.values ){
        const settingsOption = setting.values.map((elem, index) => { return <option value={elem} key={setting.name + "-option-" + elem}>{lang.SETTINGS_ITEMS[setting.name].select[index] ?? elem}</option> })
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}<select onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}} value={syncStorage[setting.name] ?? setting.default}>{ settingsOption }</select></label>
    } else if ( setting.type == "selectButtons" && setting.values ){
        const settingsOption = setting.values.map((elem, index) => { return <button type="button" key={setting.name + "-optionbutton-" + elem} onClick={() => {setSyncStorageValue(setting.name, elem)}} className={"select-button" + ((syncStorage[setting.name] ?? setting.default) == elem ? " select-button-current" : "")}>{lang.SETTINGS_ITEMS[setting.name].select[index] ?? elem}</button> })
        return <><label key={setting.name}>{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}</label><div className="select-button-container" key={`${setting.name}-selectbutton`}>{ settingsOption }</div></>
    } else if ( setting.type == "inputNumber" ) {
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}<input type="number" min={setting.min} max={setting.max} value={(syncStorage[setting.name] ?? setting.default)} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}}/></label>
    } else if ( setting.type == "inputString" ) {
        //console.log(syncStorage[settings.name])
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[setting.name].name ?? setting.name}<input type="text" value={(syncStorage[setting.name] ?? setting.default)} placeholder={lang.SETTINGS_ITEMS[setting.name].placeholder ?? (setting.placeholder ?? null)} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}}/></label>
    } else {
        return <label key={setting.name}>Unknown settings type</label>
    }
}
function createSettingsRow(setting: setting, isEditMode: boolean) {
    if ( !setting || setting.type == "desc" ) return
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: setting.name, disabled: !isEditMode})
    const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
    return <div className="settings-row settings-row-qo" key={`${setting.name}-row`} ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
        <CreateSettingsControl setting={setting} isEditMode={isEditMode}/>
    </div>
}

function CreateQuickOption() {
    const lang = useLang()
    const [ syncStorage, setSyncStorageValue ]: any = useSyncStorage()
    const [ isEditMode, setIsEditMode ] = useState(false)
    const settingsObj: any = {}
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
    function handleDragEnd(e: DragEndEvent) {
        const {active, over} = e;
        if (over && active.id !== over.id) {
            const oldIndex = settingsFilter.indexOf(active.id);
            const newIndex = settingsFilter.indexOf(over.id);
            const sortAfterList = arrayMove(settingsFilter, oldIndex, newIndex);
            setSyncStorageValue("quickoptionlist", sortAfterList)
        }
    }
    // #endregion

    // functionにしないとなぜかDNDが機能しない
    function SettingsList() {
        return settingsFilter.map((elem: any) => {return createSettingsRow(settingsObj[elem], isEditMode)})
    }

    const selectRef = useRef<any>(null)
    function onAddButtonClicked() {
        if ( !selectRef.current ) return;
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
                    return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[elem as keyof typeof lang.SETTINGS_ITEMS].name ?? elem}</option>
                })}
            </select>
            <button onClick={onAddButtonClicked} className="quickoption-button-add">{lang.ADD}</button></div>}
    </div>
}


export default CreateQuickOption;
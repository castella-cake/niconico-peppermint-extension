import { setting, settingList } from "../../utils/settingsList";
import { useStorageContext } from "@/hooks/extensionHook";
import { useLang } from "@/hooks/localizeHook";

function createSettingsControl(setting: setting) {
    //console.log(lang.SETTINGS_ITEMS[settings.name].name)
    const lang: any = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()

    if ( !setting ) return

    const settingName = setting.name as keyof typeof lang.SETTINGS_ITEMS
    if ( setting.type == "checkbox" ) {
        return <label key={setting.name}><input type="checkbox" checked={syncStorage[setting.name] ?? setting.default} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.checked)}} />{lang.SETTINGS_ITEMS[settingName].name ?? setting.name}</label>
    } else if ( setting.type == "select" && setting.values ){
        const settingsOption = setting.values.map((elem, index) => { return <option value={elem} key={elem}>{lang.SETTINGS_ITEMS[settingName].select[index] ?? elem}</option> })
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[settingName].name ?? setting.name}<select onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}} value={syncStorage[setting.name] ?? setting.default}>{ settingsOption }</select></label>
    } else if ( setting.type == "selectButtons" && setting.values ){
        const settingsOption = setting.values.map((elem, index) => { return <button type="button" key={elem} onClick={() => {setSyncStorageValue(setting.name, elem)}} className={"select-button" + ((syncStorage[setting.name] ?? setting.default) == elem ? " select-button-current" : "")}>{lang.SETTINGS_ITEMS[settingName].select[index] ?? elem}</button> })
        return <><label key={setting.name}>{lang.SETTINGS_ITEMS[settingName].name ?? setting.name}</label><div className="select-button-container" key={`${setting.name}-selectbutton`}>{ settingsOption }</div></>
    } else if ( setting.type == "inputNumber" ) {
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[settingName].name ?? setting.name}<input type="number" min={setting.min} max={setting.max} value={(syncStorage[setting.name] ?? setting.default)} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}}/></label>
    } else if ( setting.type == "inputString" ) {
        //console.log(syncStorage[settings.name])
        return <label key={setting.name}>{lang.SETTINGS_ITEMS[settingName].name ?? setting.name}<input type="text" value={(syncStorage[setting.name] ?? setting.default)} placeholder={lang.SETTINGS_ITEMS[settingName].placeholder ?? (setting.placeholder ?? null)} onChange={(e) => {setSyncStorageValue(setting.name, e.currentTarget.value)}}/></label>
    } else if ( setting.type == "desc") {
        return <div key={setting.name} className="desc">
            {lang.SETTINGS_ITEMS[settingName].name ?? setting.name}
            {setting.href && <a href={setting.href} target="_blank">{lang.SETTINGS_ITEMS[settingName].linktitle ?? "LINK"}</a>}
        </div>
    } else {
        return <label key={setting.name}>Unknown settings type</label>
    }
}

function LinkElem({ setting }: { setting: setting }) {
    const lang = useLang()
    if ( setting.settingLink ) {
        const settingsLink = lang[setting.settingLink.name as keyof typeof lang] as string
        return <a target="_self" className="settinglink" href={setting.settingLink.href}>{settingsLink ?? setting.settingLink.name}</a>
    } else {
        return <></>
    }
}
function HintElem({ setting }: { setting: setting }) {
    const lang: any = useLang()
    if ( lang.SETTINGS_ITEMS[setting.name].hint && lang.SETTINGS_ITEMS[setting.name].hint !== "" ) {
        return <div className="hint">{lang.SETTINGS_ITEMS[setting.name].hint ?? ""}</div>
    } else {
        return <></>
    }
}

function createSettingsRow(setting: setting) {
    //console.log(syncStorage[settings.name])
    let elemList = []
    elemList.push(createSettingsControl(setting))
    if ( setting.children ) {
        //console.log(settings.children)
        const childrenSettingsElemList = setting.children.map((elem) => {
            return createSettingsControl(elem)
        })
        //console.log(childrenSettingsElemList)
        elemList = elemList.concat(childrenSettingsElemList)
    }
    return <div className="settings-row" key={`${setting.name}-row`}>{ elemList }<HintElem setting={setting}/><LinkElem setting={setting}/></div>
}

function CreateSettingsList({settings}: {settings: settingList}) {
    const lang: any = useLang()

    const anchorArray = Object.keys(settings).map((elem) => {
        return <a className="settings-anchor-item" href={`#${elem}`} key={`anchor-${elem}`}>{lang.SETTINGS_AREATITLE[elem] ?? elem}</a>
    })
    const elemArray = Object.keys(settings).map((elem) => {
        const settingsAreaElems = settings[elem].map((settingsElem) => {
            //console.log(settingsElem)
            return createSettingsRow(settingsElem)
        })
        return <div className="settings-area" key={elem} id={elem}><h1>{lang.SETTINGS_AREATITLE[elem] ?? elem}</h1>{settingsAreaElems}</div>
    })
    //console.log(elemArray)
    return <>
        { Object.keys(settings).length > 1 && <div className="settings-anchors">{anchorArray}</div> }
        { elemArray }
    </>
}


export default CreateSettingsList;
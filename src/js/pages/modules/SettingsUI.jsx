import settings from "./settingsList";
import "../../../style/pages/settingsUI.styl"
import { useStorageContext } from "./extensionHook";
import { useLang } from "./localizeHook";

function CreateSettingsList() {
    const lang = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()
    function createSettingsControl(settings) {
        //console.log(lang.SETTINGS_ITEMS[settings.name].name)
        if ( !settings ) return
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
        } else if ( settings.type == "desc") {
            return <div key={settings.name} className="desc">
                {lang.SETTINGS_ITEMS[settings.name].name ?? settings.name}
                {settings.href && <a href={settings.href} target="_blank">{lang.SETTINGS_ITEMS[settings.name].linktitle ?? "LINK"}</a>}
            </div>
        } else {
            return <label key={settings.name}>Unknown settings type</label>
        }
    }
    function createSettingsRow(settings) {
        //console.log(syncStorage[settings.name])
        let elemList = []
        elemList.push(createSettingsControl(settings))
        if ( settings.children ) {
            //console.log(settings.children)
            const childrenSettingsElemList = settings.children.map((elem) => {
                return createSettingsControl(elem)
            })
            //console.log(childrenSettingsElemList)
            elemList = elemList.concat(childrenSettingsElemList)
        }
        function LinkElem() {
            if ( settings.settingLink ) {
                return <a target="_self" className="settinglink" href={settings.settingLink.href}>{lang[settings.settingLink.name] ?? settings.settingLink.name}</a>
            } else {
                return <></>
            }
        }
        function HintElem() {
            if ( lang.SETTINGS_ITEMS[settings.name].hint && lang.SETTINGS_ITEMS[settings.name].hint !== "" ) {
                return <div className="hint">{lang.SETTINGS_ITEMS[settings.name].hint ?? ""}</div>
            } else {
                return <></>
            }
        }
        return <div className="settings-row" key={`${settings.name}-row`}>{ elemList }<HintElem/><LinkElem/></div>
    }
    const elemArray = Object.keys(settings).map((elem) => {
        const settingsAreaElems = settings[elem].map((settingsElem) => {
            //console.log(settingsElem)
            return createSettingsRow(settingsElem)
        })
        return <div className="settings-area" key={elem}><h1>{lang.SETTINGS_AREATITLE[elem] ?? elem}</h1>{settingsAreaElems}</div>
    })
    //console.log(elemArray)
    return <>{ elemArray }</>
}


export default CreateSettingsList;
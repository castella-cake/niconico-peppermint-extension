import { useStorageContext } from "../extensionHook";

const manifestData = chrome.runtime.getManifest();

type setting = {
    type: "select" | "checkbox"
    options?: any[],
    defaultValue: any,
    texts?: string[],
    name: string,
    hint?: string,
}

const settings: { [key: string]: setting } = {
    playerAreaSize: {
        type: "select",
        options: [0,1,2],
        defaultValue: 1,
        texts: ["小(0.4)", "中(0.6)", "フル(1)"],
        name: "プレイヤーサイズ",
        hint: "そのエリアに属している要素もリサイズされます。また、3カラムでは使用できません。"
    },
    commentOpacity: {
        type: "select",
        options: [0.5, 0.75, 1],
        defaultValue: 1,
        texts: ["薄い(0.5)", "やや薄い(0.75)", "透過なし(1)"],
        name: "コメント透過",
    },
}

function Settings() {
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorage.playersettings, [name]: value })
    }
    const { localStorage, setLocalStorageValue } = useStorageContext()
    
    return <div className="playersettings-container" id="pmw-player-settings">
        <div className="playersettings-title">プレイヤー設定</div>
        <p>
            Version {manifestData.version_name}
        </p>
        <p>
            この設定はローカルに保存されます。<br/>
            視聴ページの設定はPepperMint+の設定から変更してください。<br/>
        </p>

        { Object.keys(settings).map((name, index) => {
            const elem = settings[name]
            if ( elem.type === "select" ) {
                return <div className="playersettings-item" key={index}>
                    <label>
                        {elem.name}
                        <select value={localStorage.playersettings[name] || elem.defaultValue} onChange={(e) => {writePlayerSettings(name, e.currentTarget.value)}}>
                            {elem.options && elem.options.map((option, index) => {
                                return <option value={option} key={`${name}-${index}`}>{elem.texts && elem.texts[index]}</option>
                            })}
                        </select>
                    </label>
                    { elem.hint && <div className="playersettings-hint">{elem.hint}</div> }
                </div>
            }
        }) }
        Work in progress!
    </div>
}


export default Settings;
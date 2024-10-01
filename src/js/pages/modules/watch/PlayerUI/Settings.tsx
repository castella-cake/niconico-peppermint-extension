import { Dispatch, SetStateAction } from "react";
import { useStorageContext } from "../../extensionHook";

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
        texts: ["小", "中", "フル"],
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
    enableLoudnessData: {
        type: "checkbox",
        defaultValue: true,
        name: "ラウドネスノーマライズ"
    },
    enableAutoPlay: {
        type: "checkbox",
        defaultValue: false,
        name: "自動再生",
    },
    playbackRate: {
        type: "select",
        options: [0.1,0.25,0.5,0.75,1,1.25,1.5,1.75,2],
        texts: ["x0.1", "x0.25", "x0.5", "x0.75", "x1", "x1.25", "x1.5", "x1.75", "x2"],
        name: "再生速度",
        defaultValue: 1.0,
    },
    enableFullscreenSmartControl: {
        type: "checkbox",
        defaultValue: false,
        name: "フルスクリーンでコントローラーを動的表示",
    },
    enableCommentPiP: {
        type: "checkbox",
        defaultValue: false,
        name: "PiPでコメントを表示",
    }
}

function Settings({ isStatsShown, setIsStatsShown }: {isStatsShown: boolean, setIsStatsShown: Dispatch<SetStateAction<boolean>>}) {
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
                return <div className="playersettings-item" key={name}>
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
            } else if ( elem.type === "checkbox" ) {
                return <div className="playersettings-item" key={name}>
                    <label>
                        <input type="checkbox" checked={localStorage.playersettings[name] ?? elem.defaultValue} onChange={(e) => {writePlayerSettings(name, e.currentTarget.checked)}}/>
                        {elem.name}
                    </label>
                    { elem.hint && <div className="playersettings-hint">{elem.hint}</div> }
                </div>
            }
        }) }
        <div className="playersettings-item">
            <label>
                統計情報を表示(一時的)
                <input type="checkbox" checked={isStatsShown} onChange={(e) => {setIsStatsShown(e.currentTarget.checked)}}/>
            </label>
        </div>
        Work in progress!
    </div>
}


export default Settings;
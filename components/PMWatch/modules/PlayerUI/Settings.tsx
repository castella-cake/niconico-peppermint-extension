import { useStorageContext } from "@/hooks/extensionHook";
import { Dispatch, RefObject, SetStateAction } from "react";


const manifestData = browser.runtime.getManifest();

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
        hint: "全体的なページの横幅が変更されます。"
    },
    commentOpacity: {
        type: "select",
        options: [0.25, 0.5, 0.75, 1],
        defaultValue: 1,
        texts: ["非常に薄い(25%)", "薄い(50%)", "やや薄い(75%)", "透過なし"],
        name: "コメント透過",
        hint: "「PiPでコメントを表示」が有効の場合は使用できません。",
    },
    playbackRate: {
        type: "select",
        options: [0.1,0.25,0.5,0.75,1,1.25,1.5,1.75,2],
        texts: ["x0.1", "x0.25", "x0.5", "x0.75", "x1", "x1.25", "x1.5", "x1.75", "x2"],
        name: "再生速度",
        defaultValue: 1.0,
    },
    integratedControl: {
        type: "select",
        defaultValue: "never",
        options: ["never","fullscreen","always"],
        texts: ["分割表示","全画面時のみ統合表示","常に統合表示"],
        name: "コントローラーの表示",
    },
    autoPlayType: {
        type: "select",
        defaultValue: "playlistonly",
        options: ["never", "playlistonly", "always"],
        name: "自動再生",
        texts: ["しない", "プレイリストがある場合", "常に"]
    },
    sharedNgLevel: {
        type: "select",
        defaultValue: "mid",
        options: ["none","low","mid","high"],
        name: "スコアに基づくコメントNGレベル",
        texts: ["なし","低 (< -10000)","中 (< -4800)","高 (< -1000)"],
    },
    commentRenderFPS: {
        type: "select",
        defaultValue: 60,
        options: [30, 60, 120],
        name: "コメント描画FPS",
        texts: ["30FPS","60FPS","120FPS"],
    },
    enableResumePlayback: {
        type: "checkbox",
        defaultValue: true,
        name: "レジューム再生",
        hint: "プレミアム会員資格が必要です。"
    },
    /*enableCommentPiP: {
        type: "checkbox",
        defaultValue: false,
        name: "PiPでコメントを表示",
    },*/
    enableLoudnessData: {
        type: "checkbox",
        defaultValue: true,
        name: "ラウドネスノーマライズ"
    },
    requestMonitorFullscreen: {
        type: "checkbox",
        defaultValue: true,
        name: "モニターサイズのフルスクリーンを使用",
    },
}

function Settings({ isStatsShown, setIsStatsShown, nodeRef }: {isStatsShown: boolean, setIsStatsShown: Dispatch<SetStateAction<boolean>>, nodeRef: RefObject<HTMLDivElement>}) {
    const { localStorage, setLocalStorageValue } = useStorageContext()
    const localStorageRef = useRef<any>(null)
    localStorageRef.current = localStorage
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorageRef.current.playersettings, [name]: value })
    }
    
    return <div className="playersettings-container" id="pmw-player-settings" ref={nodeRef}>
        <div className="playersettings-title">プレイヤー設定</div>
        <p>
            Version {manifestData.version_name || manifestData.version || "Unknown"}
        </p>
        <p>
            この設定はローカルに保存されます。<br/>
            視聴ページの設定は左上のスパナアイコンから設定できます。<br/>
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
                <input type="checkbox" checked={isStatsShown} onChange={(e) => {setIsStatsShown(e.currentTarget.checked)}}/>
                統計情報を表示(一時的)
            </label>
        </div>
    </div>
}


export default Settings;
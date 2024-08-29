import { useStorageContext } from "../extensionHook";

const manifestData = chrome.runtime.getManifest();

function Settings() {
    function writePlayerSettings(name: string, value: any) {
        setLocalStorageValue("playersettings", { ...localStorage.playersettings, [name]: value })
    }
    const { localStorage, setLocalStorageValue } = useStorageContext()

    const leftAreaFlexOptions = [0.4, 0.6, 1]
    return <div className="playersettings-container" id="pmw-player-settings">
        <div className="playersettings-title">プレイヤー設定</div>
        <p>
            Version {manifestData.version_name}
        </p>
        <p>
            この設定はローカルに保存されます。<br/>
            視聴ページの設定はPepperMint+の設定から変更してください。<br/>
        </p>

        <label>
            プレイヤーエリアのサイズ
            <select value={localStorage.playersettings.playerAreaSize || 1} onChange={(e) => {writePlayerSettings("playerAreaSize", e.currentTarget.value)}}>
                {leftAreaFlexOptions.map((elem, index) => {
                    return <option value={index} key={`playerAreaSize-${index}`}>{["小(0.4)", "中(0.6)", "フル(1)"][index]}</option>
                })}
            </select>
        </label>
        <div className="playersettings-hint">そのエリアに属している要素もリサイズされます。また、3カラムでは使用できません。</div>
        Work in progress!
    </div>
}


export default Settings;
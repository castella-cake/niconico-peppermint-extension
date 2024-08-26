
const manifestData = chrome.runtime.getManifest();

function Settings() {
    return <div className="playersettings-container">
        <div className="playersettings-title">プレイヤー設定</div>
        <p>
            Version {manifestData.version_name}
        </p>
        <p>
            この設定はローカルに保存されます。<br/>
            視聴ページの設定はPepperMint+の設定から変更してください。<br/>
        </p>
        Work in progress!
    </div>
}


export default Settings;
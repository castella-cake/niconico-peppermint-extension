import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";

function PluginList() {
    const [ isPluginListShown, setIsPluginListShown ] = useState(false)
    return <footer className="pmw-footer" id="pmw-footer">
        <div className="footer-items global-flex">
            <button type="button" className="plugin-list-title" onClick={() => {setIsPluginListShown(!isPluginListShown)}}>
                プラグインリスト{ isPluginListShown ? <IconChevronUp/> :<IconChevronDown/>}
            </button>
            <div className="footer-links global-flex1">
                <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Sponsor</a>
                <a href="https://github.com/castella-cake/niconico-peppermint-extension/issues" target="_blank" rel="noopener noreferrer" className="titlelink">Feedback</a>
            </div>
        </div>
        <div className={isPluginListShown ? "plugin-list-display" : "plugin-list-display-hidden"}>
            <p>
                このプラグインリストは、視聴ページのコンポーネントによって管理されていません。<br/>
                各表示はプラグインのスクリプトによって自己管理されます。<br/>
                もしこの下に何も表示されなければ、まだプラグインが何もインストールされていないか、ここに表示をしていません。
            </p>
            <div id="pmw-plugin-list">
            </div>
        </div>
    </footer>
}


export default PluginList;
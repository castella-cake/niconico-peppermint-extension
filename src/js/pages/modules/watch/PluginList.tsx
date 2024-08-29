import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";

function PluginList() {
    const [ isPluginListShown, setIsPluginListShown ] = useState(false)
    return <div className="plugin-list-container">
        <button type="button" className="plugin-list-title" onClick={() => {setIsPluginListShown(!isPluginListShown)}}>プラグインリスト{ isPluginListShown ? <IconChevronUp/> :<IconChevronDown/>}</button>
        <div className={isPluginListShown ? "plugin-list-display" : "plugin-list-display-hidden"}>
            <p>
                このプラグインリストは、視聴ページのコンポーネントによって管理されていません。<br/>
                各表示はプラグインのスクリプトによって自己管理されます。
            </p>
            <div id="pmw-plugin-list">
            </div>
        </div>
    </div>
}


export default PluginList;
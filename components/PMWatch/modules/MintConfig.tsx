
import CreateSettingsList from "@/components/pages/SettingsUI";
import settings from "@/utils/settingsList";
import { RefObject } from "react";

export function MintConfig({ nodeRef }: { nodeRef: RefObject<HTMLDivElement>}) {
    const settingsObject = { "mintwatch": settings.mintwatch.filter(setting => setting.type !== "desc") }
    return <div className="mintwatch-config" id="pmw-config" ref={nodeRef}>
        <h2>MintWatch の設定</h2>
        <CreateSettingsList settings={settingsObject}/>
        <div className="mintwatch-config-credit">
            <p>
                Developed by CYakigasi<br/>
                Special Thanks to niconicomments
            </p>
        </div>
    </div>
}
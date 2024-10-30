
import CreateSettingsList from "@/components/pages/SettingsUI";
import settings from "@/utils/settingsList";
import { RefObject } from "react";

export function MintConfig({ nodeRef }: { nodeRef: RefObject<HTMLDivElement>}) {
    const settingsObject = { "mintwatch": settings.mintwatch }
    return <div className="mintwatch-config" id="pmw-config" ref={nodeRef}>
        <h2>MintWatch の設定</h2>
        <CreateSettingsList settings={settingsObject}/>
    </div>
}
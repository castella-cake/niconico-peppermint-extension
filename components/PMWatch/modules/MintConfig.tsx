
import CreateSettingsList from "@/components/pages/SettingsUI";
import settings from "@/utils/settingsList";
import { IconX } from "@tabler/icons-react";
import { Dispatch, RefObject, SetStateAction } from "react";

export function MintConfig({ nodeRef, setIsMintConfigShown }: { nodeRef: RefObject<HTMLDivElement>, setIsMintConfigShown: Dispatch<SetStateAction<boolean>> }) {
    const settingsObject = { "mintwatch": settings.mintwatch.filter(setting => setting.type !== "desc") }
    return <div className="mintwatch-config" id="pmw-config" ref={nodeRef}>
        <h2>MintWatch の設定<button onClick={() => {setIsMintConfigShown(false)}}><IconX/></button></h2>
        <CreateSettingsList settings={settingsObject}/>
        <div className="mintwatch-config-credit">
            <p>
                Developed by CYakigasi<br/>
                Special Thanks to niconicomments
            </p>
        </div>
    </div>
}
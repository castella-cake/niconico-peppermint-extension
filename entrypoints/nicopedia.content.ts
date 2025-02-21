import { getSyncStorageData } from "../utils/storageControl";
import { addCSS } from "../utils/styleControl";

export default defineContentScript({
    matches: ["*://dic.nicovideo.jp/*"],
    runAt: "document_end",
    main() {
        getSyncStorageData.then(createCSSRule, onError);
        function createCSSRule(result: any) {
            if ( result.dicfullwidth === true && result.dicforcewidthmode !== "auto" && result.dicforcewidthmode !== "100" ) {
                addCSS(browser.runtime.getURL("/style/css/nicopedia/fullwidth.css"))
            } else if ( result.dicfullwidth === true && result.dicforcewidthmode === "auto" ) {
                addCSS(browser.runtime.getURL("/style/css/nicopedia/fullwidth_forceauto.css"))
            } else if ( result.dicfullwidth === true && result.dicforcewidthmode === "100" ) {
                addCSS(browser.runtime.getURL("/style/css/nicopedia/fullwidth_force100.css"))
            }
            if ( result.dicbettereditor ) {
                addCSS(browser.runtime.getURL("/style/css/nicopedia/bettereditor.css"))
            }
        }
    },
});

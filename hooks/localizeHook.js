import ja from "../langs/ja.json"
import en from "../langs/en-US.json"

export function useLang() {
    if ( window.navigator.language == "ja-JP" || window.navigator.language == "ja" ) {
        return ja
    } else {
        return en
    }
}
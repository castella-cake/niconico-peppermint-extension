import "./style/modules/darkmode/external/koken.styl"

export default defineContentScript({
    matches: ["*://koken.nicovideo.jp/*"],
    main() {
        // style用なので実行するものはありません
    },
});


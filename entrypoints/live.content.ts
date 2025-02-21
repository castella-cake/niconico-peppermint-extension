import "./style/modules/darkmode/external/nicolive.styl"

export default defineContentScript({
    matches: ["*://live.nicovideo.jp/*"],
    main() {
        // style用なので実行するものはありません
    },
});


import "./style/modules/darkmode/external/inform.styl"

export default defineContentScript({
    matches: ["*://inform.nicovideo.jp/*"],
    main() {
        // style用なので実行するものはありません
    },
});


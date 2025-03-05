import "./style/modules/darkmode/external/nicolive.styl"

export default defineContentScript({
    matches: ["*://live.nicovideo.jp/*"],
    runAt: "document_start",
    main() {
        // style用なので実行するものはありません
    },
});


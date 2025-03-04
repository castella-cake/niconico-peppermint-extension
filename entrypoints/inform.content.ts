import "./style/modules/darkmode/external/inform.styl"

export default defineContentScript({
    matches: ["*://inform.nicovideo.jp/*"],
    runAt: "document_start",
    main() {
        // style用なので実行するものはありません
    },
});


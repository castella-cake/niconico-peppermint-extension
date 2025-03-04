import "./style/modules/darkmode/external/koken.styl"

export default defineContentScript({
    matches: ["*://koken.nicovideo.jp/*"],
    runAt: "document_start",
    main() {
        // style用なので実行するものはありません
    },
});


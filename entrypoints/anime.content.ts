import "./style/modules/darkmode/external/nanime.styl"

export default defineContentScript({
    matches: ["*://anime.nicovideo.jp/*"],
    runAt: "document_start",
    main() {
        // style用なので実行するものはありません
    },
});


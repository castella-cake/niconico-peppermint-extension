import "./style/modules/darkmode/external/nanime.styl"

export default defineContentScript({
    matches: ["*://anime.nicovideo.jp/*"],
    main() {
        // style用なので実行するものはありません
    },
});


import "./style/dm_external.styl"

export default defineContentScript({
    matches: ["*://live.nicovideo.jp/*", "*://blog.nicovideo.jp/*", "*://anime.nicovideo.jp/*", "*://inform.nicovideo.jp/*", "*://koken.nicovideo.jp/*"],
    main() {
        // style用なので実行するものはありません
    },
});


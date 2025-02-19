import "./style/modules/darkmode/external/nicoad/choice.styl"

export default defineContentScript({
    matches: ["*://nicoad.nicovideo.jp/video/choice-player-widget/*"],
    allFrames: true,
    async main() {
    },
});


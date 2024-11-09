import { VideoDataRootObject } from "@/types/VideoData";

export function PPVScreen({ videoInfo }: { videoInfo: VideoDataRootObject}) {
    if (!videoInfo.data || videoInfo.data?.response.media.domand) return
    const isPPV = videoInfo.data?.response.payment.preview.ppv.isEnabled
    const isPremiumOnly = videoInfo.data?.response.payment.preview.premium.isEnabled
    return <div className="player-ppvscreen">
        <div className="player-ppvscreen-title">有料動画</div>
        {isPPV && "未レンタル/未加入のため再生できません"}
        {isPremiumOnly && "一般会員のため再生できません"}
    </div>
}
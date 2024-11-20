import { VideoDataRootObject } from "@/types/VideoData";

export function ErrorScreen({ videoInfo }: { videoInfo: VideoDataRootObject}) {
    if (!videoInfo.data || videoInfo.data?.response.media.domand && videoInfo.data.response.viewer) return
    const isPPV = videoInfo.data?.response.payment.preview.ppv.isEnabled
    const isPremiumOnly = videoInfo.data?.response.payment.preview.premium.isEnabled
    const viewer = videoInfo.data.response.viewer
    return <div className="player-errorscreen">
        <h2 className="player-errorscreen-title">{viewer ? "有料動画" : "ログインが必要です"}</h2>
        {!viewer && <p>MintWatch はゲストアカウントでの視聴に対応していません。<br/>続けるにはログインしてください。</p>}
        {isPPV && "未レンタル/未加入のため再生できません"}
        {isPremiumOnly && "一般会員のため再生できません"}
    </div>
}
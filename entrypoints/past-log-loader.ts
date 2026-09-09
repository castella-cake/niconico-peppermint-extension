// www.nicovideo.jp のページ上で window.fetch をラップし、
// ?past_log=<unix epoch> が URL に含まれる場合に
// https://public.nvcomment.nicovideo.jp/v1/threads への
// リクエストペイロードに { additionals: { when: <epoch> } } を
// 統合してからフェッチする。
// このスクリプトはメイン世界で動作するため、拡張機能のAPIは使えない。

const TARGET_URL_PREFIX = "https://public.nvcomment.nicovideo.jp/v1/threads";

function readEpochFromLocation(): number | null {
    try {
        const raw = new URL(window.location.href).searchParams.get("past_log");
        if (raw === null || raw === "") return null;

        // 数字だけで構成されているか (整数のみ受け付ける)
        if (!/^-?\d+$/.test(raw)) return null;

        const epoch = Number(raw);
        if (!Number.isFinite(epoch) || !Number.isInteger(epoch) || epoch <= 0) return null;

        // 「過去の」unix epoch であるか
        const nowSec = Math.floor(Date.now() / 1000);
        if (epoch >= nowSec) return null;

        return epoch;
    } catch {
        return null;
    }
}

function getRequestUrl(input: RequestInfo | URL): string | null {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    if (typeof Request !== "undefined" && input instanceof Request) return input.url;
    return null;
}

export default defineUnlistedScript(() => {
    const epoch = readEpochFromLocation();
    if (epoch === null) return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = function patchedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        const url = getRequestUrl(input);
        if (url === null || !url.startsWith(TARGET_URL_PREFIX)) {
            return originalFetch(input, init);
        }

        // ボディがない、もしくはJSON文字列でない場合はそのまま通す
        if (!init || typeof init.body !== "string") {
            return originalFetch(input, init);
        }

        let payload: unknown;
        try {
            payload = JSON.parse(init.body);
        } catch {
            // パースに失敗したらそのまま通す
            return originalFetch(input, init);
        }

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return originalFetch(input, init);
        }

        const obj = payload as Record<string, unknown>;
        const existingAdditionals = (obj.additionals && typeof obj.additionals === "object" && !Array.isArray(obj.additionals))
            ? { ...(obj.additionals as Record<string, unknown>) }
            : {};
        existingAdditionals.when = epoch;
        obj.additionals = existingAdditionals;

        const newInit: RequestInit = { ...init, body: JSON.stringify(obj) };
        return originalFetch(input, newInit);
    };
});
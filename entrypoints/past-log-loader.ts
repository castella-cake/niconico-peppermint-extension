// www.nicovideo.jp のページ上で window.fetch をラップし、
// ?past_log=<unix epoch> が URL に含まれる場合に
// https://public.nvcomment.nicovideo.jp/v1/threads への
// リクエストペイロードに { additionals: { when: <epoch> } } を
// 統合してからフェッチする。
// ?past_log=<threadId>/comments への POST を検出したら、
// 以後は過去ログ扱いしないよう epoch を破棄し、
// location から past_log クエリも外す。
// このスクリプトはメイン世界で動作するため、拡張機能のAPIは使えない。

const TARGET_URL_PREFIX = "https://public.nvcomment.nicovideo.jp/v1/threads";
// 任意スレッドIDのコメント投稿エンドポイント (POST)
const COMMENTS_POST_PATTERN = /^https:\/\/public\.nvcomment\.nicovideo\.jp\/v1\/threads\/[^/]+\/comments(?:\?.*)?$/;

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

function stripPastLogFromLocation(): void {
    try {
        const u = new URL(window.location.href);
        if (!u.searchParams.has("past_log")) return;
        u.searchParams.delete("past_log");
        // 履歴を増やさず URL だけ書き換える
        window.history.replaceState(window.history.state, "", u.toString());
    } catch {
        // 失敗しても致命ではない
    }
}

export default defineUnlistedScript(() => {
    let currentEpoch: number | null = readEpochFromLocation();
    if (currentEpoch === null) return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = function patchedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        const url = getRequestUrl(input);
        if (url === null || !url.startsWith(TARGET_URL_PREFIX)) {
            return originalFetch(input, init);
        }

        const method = (init?.method ?? (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET")).toUpperCase();

        // コメント投稿 (POST) を検出したら、それ以降は過去ログとして扱わない
        if (method === "POST" && COMMENTS_POST_PATTERN.test(url)) {
            currentEpoch = null;
            stripPastLogFromLocation();
            return originalFetch(input, init);
        }

        // 既に past_log 失効済みならそのまま通す
        if (currentEpoch === null) {
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
        existingAdditionals.when = currentEpoch;
        obj.additionals = existingAdditionals;

        const newInit: RequestInit = { ...init, body: JSON.stringify(obj) };
        return originalFetch(input, newInit);
    };
});
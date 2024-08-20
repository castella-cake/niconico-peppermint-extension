// key
interface KeyRootObjectResponse {
    meta: KeyMeta;
    data: KeyData;
}

interface KeyData {
    postKey: string;
}

interface KeyMeta {
    status: number;
}
//commentpost
interface CommentPostBody {
    videoId: string;
    commands: string[];
    body: string;
    vposMs: number;
    postKey: string;
}
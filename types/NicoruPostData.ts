export interface NicoruKeyResponseRootObject {
    meta: Meta;
    data: NicoruKeyResponseData;
}

interface Meta {
    status: number;
}

interface NicoruKeyResponseData {
    nicoruKey: string;
}

export interface NicoruPostBodyRootObject {
    videoId: string;
    fork: string;
    no: number;
    content: string;
    nicoruKey: string;
}

export interface NicoruPostResponseRootObject {
    meta: Meta;
    data: NicoruPostResponseData;
}

interface NicoruPostResponseData {
    nicoruCount: number;
    nicoruId: string;
}

export interface NicoruRemoveRootObject {
    meta: Meta;
    data: any[];
}
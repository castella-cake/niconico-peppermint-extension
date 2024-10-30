export interface MylistResponseRootObject {
    meta: Meta;
    data: Data;
}

interface Data {
    id: Id;
    meta: Meta2;
    totalCount: number;
    items: Item[];
}

interface Item {
    watchId: string;
    content: Content;
}

interface Content {
    type: string;
    id: string;
    title: string;
    registeredAt: string;
    count: Count;
    thumbnail: Thumbnail;
    duration: number;
    shortDescription: string;
    latestCommentSummary: string;
    isChannelVideo: boolean;
    isPaymentRequired: boolean;
    playbackPosition: null | number;
    owner: Owner;
    requireSensitiveMasking: boolean;
    videoLive: null;
    isMuted: boolean;
}

interface Owner {
    ownerType: string;
    type: string;
    visibility: string;
    id: string;
    name: string;
    iconUrl: string;
}

interface Thumbnail {
    url: string;
    middleUrl: string;
    largeUrl: string;
    listingUrl: string;
    nHdUrl: string;
}

interface Count {
    view: number;
    comment: number;
    mylist: number;
    like: number;
}

interface Meta2 {
    title: string;
    ownerName: string;
}

interface Id {
    type: string;
    value: string;
}

interface Meta {
    status: number;
}
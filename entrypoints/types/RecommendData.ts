// JSON to TS で生成したものを手直ししたものです
// mylistの扱いとかもうちょっと修正したいですが、とりあえず名前の書き直しだけしています
export interface RecommendDataRootObject {
    meta?: Meta;
    data?: Data;
}

interface Data {
    recipe: Recipe;
    recommendId: string;
    items: RecommendItem[];
}

export interface RecommendItem {
    id: string;
    contentType: string;
    recommendType: string;
    content: Content;
}

interface Content {
    type?: string;
    id: number | string;
    title?: string;
    registeredAt?: string;
    count?: Count;
    thumbnail?: SeriesThumbnail;
    duration?: number;
    shortDescription?: string;
    latestCommentSummary?: string;
    isChannelVideo?: boolean;
    isPaymentRequired?: boolean;
    playbackPosition?: null | number;
    owner: Owner;
    requireSensitiveMasking?: boolean;
    videoLive?: null;
    isMuted?: boolean;
    isPublic?: boolean;
    name?: string;
    description?: string;
    decoratedDescriptionHtml?: string;
    defaultSortKey?: string;
    defaultSortOrder?: string;
    itemsCount?: number;
    sampleItems?: SampleItem[];
    followerCount?: number;
    createdAt?: string;
    isFollowing?: boolean;
}

interface SampleItem {
    itemId: number;
    watchId: string;
    description: string;
    decoratedDescriptionHtml: string;
    addedAt: string;
    status: string;
    video: Video;
}

export interface Video {
    type: string;
    id: string;
    title: string;
    registeredAt: string;
    count: Count;
    thumbnail: VideoThumbnail;
    duration: number;
    shortDescription: string;
    latestCommentSummary: string;
    isChannelVideo: boolean;
    isPaymentRequired: boolean;
    playbackPosition: null;
    owner: Owner;
    requireSensitiveMasking: boolean;
    videoLive: null;
    isMuted: boolean;
}

interface VideoThumbnail {
    url: string;
    middleUrl: string;
    largeUrl: string;
    listingUrl: string;
    nHdUrl: string;
}

interface Owner {
    ownerType: string;
    type: string;
    visibility: string;
    id: string;
    name: string;
    iconUrl: string;
}

interface SeriesThumbnail {
    url: string;
    middleUrl: null | string;
    largeUrl: null | string;
    listingUrl: string;
    nHdUrl: string;
}

interface Count {
    view: number;
    comment: number;
    mylist: number;
    like: number;
}

interface Recipe {
    id: string;
    meta: null;
}

interface Meta {
    status: number;
}
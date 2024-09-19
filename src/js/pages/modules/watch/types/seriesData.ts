export interface SeriesResponseRootObject {
    meta: Meta;
    data: Data;
}

interface Data {
    detail: Detail;
    totalCount: number;
    items: Item[];
}

interface Item {
    meta: Meta2;
    video: Video;
}

interface Video {
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
    playbackPosition: null;
    owner: Owner2;
    requireSensitiveMasking: boolean;
    videoLive: null;
    isMuted: boolean;
}

interface Owner2 {
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
    id: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

interface Detail {
    id: number;
    owner: Owner;
    title: string;
    description: string;
    decoratedDescriptionHtml: string;
    thumbnailUrl: string;
    isListed: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Owner {
    type: string;
    id: string;
    channel: Channel;
}

interface Channel {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    thumbnailSmallUrl: string;
}

interface Meta {
    status: number;
}
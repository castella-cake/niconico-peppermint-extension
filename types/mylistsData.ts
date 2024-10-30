export interface MylistsResponseRootObject {
    meta: Meta;
    data: Data;
}

interface Data {
    mylists: Mylist[];
}

interface Mylist {
    id: number;
    isPublic: boolean;
    name: string;
    description: string;
    decoratedDescriptionHtml: string;
    defaultSortKey: string;
    defaultSortOrder: string;
    itemsCount: number;
    owner: Owner;
    sampleItems: any[];
    followerCount: number;
    createdAt: string;
    isFollowing: boolean;
}

interface Owner {
    ownerType: string;
    type: string;
    visibility: string;
    id: string;
    name: string;
    iconUrl: string;
}

interface Meta {
    status: number;
}
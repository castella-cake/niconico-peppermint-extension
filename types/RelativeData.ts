interface CommonsRelativeRootObject {
    meta: Meta;
    data: Data;
}

interface Data {
    parents: Parents;
    children: Children;
}

interface Children {
    total: number;
    contents: Content[];
}

interface Parents {
    total: number;
    isOriginal: boolean;
    contents: Content[];
}

interface Content {
    kind: string;
    id: number;
    globalId: string;
    contentId: number;
    contentKind: string;
    visibleStatus: string;
    created: string;
    updated: string;
    title: string;
    logoURL: string;
    watchURL: string;
    treeURL: string;
    treeEditURL: string;
    thumbnailURL: string;
    description: string;
    userId: number;
    commonsMaterialKind?: string;
    parentsCount: number;
    childrenCount: number;
    isEditable: boolean;
}

interface Meta {
    status: number;
}
// JSON to TS で生成したものを手直ししたものです
// 実際使わないものは多いけど、null扱いされてしまったものでデータが入ることが想定されてそうなものはanyにしています
export interface VideoDataRootObject {
    meta?: Meta;
    data?: Data;
}

interface Data {
    metadata: Metadata;
    googleTagManager: GoogleTagManager;
    response: Response;
}

interface Response {
    // ads と category は不明
    ads: any;
    category: null;
    channel: Channel | null;
    client: Client;
    comment: Comment;
    // 多分もう復活しないのでnull
    community: null;
    easyComment: EasyComment;
    external: External;
    genre: Genre;
    marquee: Marquee;
    media: Media;
    okReason: string;
    owner: Owner;
    payment: Payment;
    pcWatchPage: PcWatchPage;
    player: Player;
    // 多分ポイントで買うやつ。復活待ち
    ppv: any;
    ranking: Ranking;
    series: Series;
    smartphone: null;
    system: System;
    tag: Tag;
    video: VideoInfo;
    videoAds: VideoAds;
    // ライブ公開のオブジェクト？
    videoLive: any;
    viewer?: ViewerInfo;
    waku: Waku;
}

interface Waku {
    // とりあえずnullはanyに直しておく
    information: Information;
    bgImages: any[];
    addContents: any;
    addVideo: any;
    tagRelatedBanner: TagRelatedBanner;
    tagRelatedMarquee: any;
}

interface TagRelatedBanner {
    title: string;
    imageUrl: string;
    description: string;
    isEvent: boolean;
    linkUrl: string;
    linkType: string;
    linkOrigin: string;
    isNewWindow: boolean;
}

interface Information {
    title: string;
    url: string;
}

export interface ViewerInfo {
    id: number;
    nickname: string;
    isPremium: boolean;
    allowSensitiveContents: boolean;
    existence: Existence;
}

interface Existence {
    age: number;
    prefecture: string;
    sex: string;
}

interface VideoAds {
    additionalParams: AdditionalParams;
    items: any[];
    reason: null;
}

interface AdditionalParams {
    videoId: string;
    videoDuration: number;
    isAdultRatingNG: boolean;
    isAuthenticationRequired: boolean;
    isR18: boolean;
    nicosid: string;
    lang: string;
    watchTrackId: string;
    genre: string;
    gender: string;
    age: number;
}

interface VideoInfo {
    id: string;
    title: string;
    description: string;
    count: Count;
    duration: number;
    thumbnail: Thumbnail3;
    rating: Rating;
    registeredAt: string;
    isPrivate: boolean;
    isDeleted: boolean;
    isNoBanner: boolean;
    isAuthenticationRequired: boolean;
    isEmbedPlayerAllowed: boolean;
    isGiftAllowed: boolean;
    viewer: ViewerVideoState;
    watchableUserTypeForPayment: string;
    commentableUserTypeForPayment: string;
}

interface ViewerVideoState {
    isOwner: boolean;
    like: Like;
}

interface Like {
    isLiked: boolean;
    // video
    count: null;
}

interface Rating {
    isAdult: boolean;
}

interface Thumbnail3 {
    url: string;
    middleUrl: string;
    largeUrl: string;
    player: string;
    ogp: string;
}

interface Tag {
    items: TagItem[];
    hasR18Tag: boolean;
    isPublishedNicoscript: boolean;
    edit: TagEditState;
    viewer: TagEditState;
}

interface TagEditState {
    isEditable: boolean;
    uneditableReason: null;
    editKey: string;
}

interface TagItem {
    name: string;
    isCategory: boolean;
    isCategoryCandidate: boolean;
    isNicodicArticleExists: boolean;
    isLocked: boolean;
}

interface System {
    serverTime: string;
    isPeakTime: boolean;
    isStellaAlive: boolean;
}

interface Series {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    video: SeriesVideos;
}

interface SeriesVideos {
    prev?: SeriesVideoItem;
    next?: SeriesVideoItem;
    first?: SeriesVideoItem;
}

export interface SeriesVideoItem {
    type: string;
    id: string;
    title: string;
    registeredAt: string;
    count: Count;
    thumbnail: SeriesThumbnail;
    duration: number;
    shortDescription: string;
    latestCommentSummary: string;
    isChannelVideo: boolean;
    isPaymentRequired: boolean;
    playbackPosition: null;
    owner: SeriesOwner;
    requireSensitiveMasking: boolean;
    videoLive: null;
    isMuted: boolean;
}

interface SeriesOwner {
    ownerType: string;
    type: string;
    visibility: string;
    id: string;
    name: string;
    iconUrl: string;
}

interface SeriesThumbnail {
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

interface Ranking {
    genre: Genre2 | null;
    popularTag: PopularTag[];
}

interface PopularTag {
    tag: string;
    regularizedTag: string;
    rank: number;
    genre: string;
    dateTime: string;
}

interface Genre2 {
    rank: number;
    genre: string;
    dateTime: string;
}

interface Player {
    initialPlayback: InitialPlayback | null;
    comment: Comment2;
    layerMode: number;
}

interface InitialPlayback {
    type: string;
    positionSec: number;
}

interface Comment2 {
    isDefaultInvisible: boolean;
}

interface PcWatchPage {
    tagRelatedBanner: null;
    videoEnd: VideoEnd;
    showOwnerMenu: boolean;
    showOwnerThreadCoEditingLink: boolean;
    showMymemoryEditingLink: boolean;
}

interface VideoEnd {
    bannerIn: null;
    overlay: null;
}

interface Payment {
    video: Video2;
    preview: Preview;
}

interface Preview {
    ppv: IsEnabled;
    admission: IsEnabled;
    continuationBenefit: IsEnabled;
    premium: IsEnabled;
}

interface Video2 {
    isPpv: boolean;
    isAdmission: boolean;
    isContinuationBenefit: boolean;
    isPremium: boolean;
    watchableUserType: string;
    commentableUserType: string;
    billingType: string;
}

interface Owner {
    id: number;
    nickname: string;
    iconUrl: string;
    channel: null;
    live: null;
    isVideosPublic: boolean;
    isMylistsPublic: boolean;
    videoLiveNotice: null;
    viewer: ViewerFollowing;
}

interface ViewerFollowing {
    isFollowing: boolean;
}

interface Media {
    domand?: Domand;
    delivery: null;
    deliveryLegacy: null;
}

interface Domand {
    videos: VideoQualityItem[];
    audios: AudioQualityItem[];
    isStoryboardAvailable: boolean;
    accessRightKey: string;
}

interface AudioQualityItem {
    id: string;
    isAvailable: boolean;
    bitRate: number;
    samplingRate: number;
    integratedLoudness: number;
    truePeak: number;
    qualityLevel: number;
    loudnessCollection: LoudnessCollection[];
}

interface LoudnessCollection {
    type: string;
    value: number;
}

interface VideoQualityItem {
    id: string;
    isAvailable: boolean;
    label: string;
    bitRate: number;
    width: number;
    height: number;
    qualityLevel: number;
    recommendedHighestAudioQualityLevel: number;
}

interface Marquee {
    isDisabled: boolean;
    tagRelatedLead: null;
}

interface Genre {
    key: string;
    label: string;
    isImmoral: boolean;
    isDisabled: boolean;
    isNotSet: boolean;
}

interface External {
    commons: Commons;
    ichiba: IsEnabled;
}

interface IsEnabled {
    isEnabled: boolean;
}

interface Commons {
    hasContentTree: boolean;
}

interface EasyComment {
    phrases: Phrase[];
}

interface Phrase {
    text: string;
    nicodic: Nicodic;
}

interface Nicodic {
    title: string;
    viewTitle: string;
    summary: string;
    link: string;
}

interface Comment {
    server: Server;
    keys: Keys;
    layers: Layer[];
    threads: Thread[];
    ng: Ng;
    isAttentionRequired: boolean;
    nvComment: NvComment;
}

interface NvComment {
    threadKey: string;
    server: string;
    params: Params;
}

interface Params {
    targets: Target[];
    language: string;
}

interface Target {
    id: string;
    fork: string;
}

interface Ng {
    ngScore: NgScore;
    channel: any[];
    owner: any[];
    viewer: ViewerNg;
}

export interface ViewerNg {
    revision: number;
    count: number;
    items: NgItem[];
}

interface NgItem {
    type: "command" | "id" | "word";
    source: string;
    registeredAt: string;
}

interface NgScore {
    isDisabled: boolean;
}

interface Thread {
    id: number;
    fork: number;
    forkLabel: string;
    videoId: string;
    isActive: boolean;
    isDefaultPostTarget: boolean;
    isEasyCommentPostTarget: boolean;
    isLeafRequired: boolean;
    isOwnerThread: boolean;
    isThreadkeyRequired: boolean;
    threadkey: null;
    is184Forced: boolean;
    hasNicoscript: boolean;
    label: string;
    postkeyStatus: number;
    server: string;
}

interface Layer {
    index: number;
    isTranslucent: boolean;
    threadIds: ThreadId[];
}

interface ThreadId {
    id: number;
    fork: number;
    forkLabel: string;
}

interface Keys {
    userKey: string;
}

interface Server {
    url: string;
}

interface Client {
    nicosid: string;
    watchId: string;
    watchTrackId: string;
}

interface GoogleTagManager {
    niconico: Niconico;
    channel: null;
}

interface Niconico {
    user: User;
    content: Content;
}

interface Content {
    player_type: string;
    genre: string;
    content_type: string;
}

interface User {
    user_id: string;
    login_status: string;
    member_status: string;
    ui_area: string;
    ui_lang: string;
}

interface Metadata {
    title: string;
    linkTags: LinkTag[];
    metaTags: MetaTag[];
    jsonLds: JsonLd[];
}

interface JsonLd {
    '@context': string;
    '@type': string;
    '@id'?: string;
    name?: string;
    description?: string;
    caption?: string;
    url?: string;
    duration?: string;
    uploadDate?: string;
    embedUrl?: string;
    interactionStatistic?: InteractionStatistic[];
    thumbnail?: Thumbnail[];
    thumbnailUrl?: string[];
    requiresSubscription?: boolean;
    isAccessibleForFree?: boolean;
    commentCount?: number;
    keywords?: string;
    genre?: string;
    playerType?: string;
    provider?: Provider;
    author?: Author;
    itemListElement?: ItemListElement[];
}

interface ItemListElement {
    '@type': string;
    position: number;
    item: Item;
}

interface Item {
    '@id': string;
    name: string;
}

interface Author {
    '@type': string;
    name: string;
    description: string;
    url: string;
}

interface Provider {
    '@type': string;
    name: string;
}

interface Thumbnail {
    '@type': string;
    url: string;
    width?: number;
    height?: number;
}

interface InteractionStatistic {
    '@type': string;
    interactionType: string;
    userInteractionCount: number;
}

interface MetaTag {
    name?: string;
    content: string;
    property?: string;
}

interface LinkTag {
    rel: string;
    href: string;
    attrs: Attr | Attrs2 | Attrs3 | any[] | Attrs5;
}

interface Attrs5 {
    type: string;
    sizes: string;
}

interface Attrs3 {
    media: string;
    class: string;
}

interface Attrs2 {
    class: string;
}

interface Attr {
    as: string;
}

interface Meta {
    status: number;
    code: string;
}

interface Channel {
    id: string;
    name: string;
    isOfficialAnime: boolean;
    isDisplayAdBanner: boolean;
    thumbnail: Thumbnail;
    viewer: Viewer;
}

interface Viewer {
    follow: Follow;
}

interface Follow {
    isFollowed: boolean;
    isBookmarked: boolean;
    token: string;
    tokenTimestamp: number;
}

interface Thumbnail {
    url: string;
    smallUrl: string;
}

export interface ErrorResponse {
    isCustomError: boolean;
    statusCode: number;
    errorCode: string;
    reasonCode: string;
    deletedMessage: null;
    communityLink: null;
    publishScheduledAt: null;
    data: null;
}
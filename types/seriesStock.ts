// ストレージsyncのstockedseriesの1要素。シリーズとフォルダーの両方をこの型で扱います
export interface SeriesStock {
    // シリーズ
    seriesID?: number;
    seriesName?: string;
    // 未視聴・次回動画(background側から更新されます)
    lastVidID?: string | null;
    lastVidName?: string | null;
    nextVidID?: string | null;
    nextVidName?: string | null;
    // フォルダー
    type?: "folder";
    name?: string;
    id?: string;
    idList?: number[];
}

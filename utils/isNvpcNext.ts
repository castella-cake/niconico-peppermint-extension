const targetPathnames = ["/watch/", "/ranking", "/tag/", "/tag_shorts/", "/search/", "/search_shorts/", "/series_search/", "/mylist_search/", "/user_search/"] 

export function isNvpcNext(location: Location): boolean {
    return location.hostname === "www.nicovideo.jp" && targetPathnames.some(path => location.pathname.startsWith(path))
}
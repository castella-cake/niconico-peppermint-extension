import { IconSearch } from "@tabler/icons-react";
import { useRef, useState } from "react";

function Search() {
    const [ isComposing, setIsComposing ] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTypes = {
        KEYWORD: 0,
        TAG: 1,
        MYLIST: 2
    }

    const [ currentSearchType, setSearchType ] = useState(searchTypes.KEYWORD);

    const startComposition = () => setIsComposing(true);
    const endComposition = () => setIsComposing(false);
    const searchTypesText = ["キーワード", "タグ", "マイリスト"]

    function handleEnter(keyName: string) {
        if (!isComposing && keyName === 'Enter') {
            onSearch();
        }
    }
    function onSearch() {
        if ( !inputRef.current ) return
        if (currentSearchType === searchTypes.KEYWORD) {
            window.location.href = `https://www.nicovideo.jp/search/${inputRef.current.value}`;
        } else if (currentSearchType  === searchTypes.TAG) {
            window.location.href = `https://www.nicovideo.jp/tag/${inputRef.current.value}`;
        } else if (currentSearchType   === searchTypes.MYLIST) {
            window.location.href = `https://www.nicovideo.jp/mylist_search/${inputRef.current.value}`;
        }
    }
    return <div className="searchbox-container" id="pmw-searchbox">
        <div className="searchbox-typeselector">
            { Object.keys(searchTypes).map((elem, index) => {
                const isActive = currentSearchType === index;
                return <button key={index} className={`searchbox-type-item ${isActive && 'searchbox-type-active'}`} onClick={() => setSearchType(index)}>{searchTypesText[index]}</button>;
            })}
        </div>
        <div className="searchbox-inputcontainer">
            <input type="text" ref={inputRef} placeholder={`${searchTypesText[currentSearchType]}で検索...`} onKeyDown={(e) => {handleEnter(e.key)}} onCompositionStart={startComposition} onCompositionEnd={endComposition}/>
            <button onClick={() => {onSearch()}} type="button" title="検索"><IconSearch/></button>
        </div>
    </div>
}


export default Search;
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { addItemToMylist, getMylists } from "../../../../utils/watchApi";
import { MylistsResponseRootObject } from "@/types/mylistsData";
import { VideoDataRootObject } from "@/types/VideoData";

type Props = {
    onClose: () => void,
    videoInfo: VideoDataRootObject,
}

async function onAddToMylist(mylistId: number, itemId: string, setAddedMylists: Dispatch<SetStateAction<number[]>>) {
    const response = await addItemToMylist(mylistId, itemId, location.href)
    if (response.meta.status === 201) {
        setAddedMylists(( current ) => [ ...current, mylistId ])
        return true
    }
}

export function Mylist({ onClose, videoInfo }: Props) {
    const [ mylistsData, setMylistsData ] = useState<MylistsResponseRootObject | null>(null);
    const [ addedMylists, setAddedMylists ] = useState<number[]>([]);
    useEffect(() => {
        async function getData() {
            const response: MylistsResponseRootObject = await getMylists()
            if (response.meta.status === 200) setMylistsData(response)
        }
        getData()
    }, [])
    return <div className="mylists-container" id="pmw-mylists">
        <div className="mylist-title global-flex"><span className="global-flex1">マイリストへ追加</span></div>
        <div className="mylist-item-container">
            {
                mylistsData ? mylistsData.data.mylists.map(elem => {
                    return <button key={ elem.id } className="mylist-item" onClick={() => {
                        if ( !addedMylists.includes(elem.id) && videoInfo.data ) onAddToMylist(elem.id, videoInfo.data.response.video.id, setAddedMylists)
                    }}>{addedMylists.includes(elem.id) && "追加済み: "}{ elem.name }</button>
                }) : <div>マイリスト取得中</div>
            }
        </div>
    </div>
}
import { useMemo } from "react";

import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useSSContext } from "./SSContext"

const { FolderRow } = require("./FolderRow");
const { SeriesRow } = require("./SeriesRow");

// 渡された配列からリストを作成する関数。
// SeriesRowとFolderRowを参照します。
export function CreateRowList(props) {
    const array = props.array
    // 個別表示するべきかしないべきかを判断するために、一旦シリーズストック内にあるフォルダーを見て、個別表示してはならないIDを列挙する
    // mapでIDリストを取ってから、reduceで繋げる
    const inFolderElemIdList = useMemo(() => array.map(elem => {
        if ( elem.type == "folder" && elem.idList && elem.idList.length > 0 ) {
            return elem.idList
        } else {
            return null
        }
    }).reduce((acm, elem) => {
        if ( acm ) {
            return acm.concat(elem)
        }
    }, []).filter(elem => elem != null), [array])

    return <>{ array.map((elem, index) => {
        // どっかのフォルダーにいるなら個別表示しちゃダメなので帰って
        if ( elem.seriesID && inFolderElemIdList && inFolderElemIdList.includes(elem.seriesID) ) {
            return
        }
        if ( elem.type == "folder" ) {
            // そのフォルダーにいるやつを現在のArrayからフィルターする
            const folderContent = array.filter(item => {
                if ( !item.seriesID || item.type == "folder" ) {
                    return false
                } 
                return elem.idList.includes(item.seriesID)
            })
            return <FolderRow folderinfo={elem} contents={folderContent} index={index}/>
        } else {
            return <SeriesRow series={elem} index={index} isfolder={props.isfolder} folderid={props.folderid} folderindex={props.folderindex}/>
        }
    })
    }</>
}

// ルートのリスト表示用コンポーネント。
// 操作: ルート項目の並び替え
export function SeriesStockRow() {
    const { syncStorage, setSyncStorageValue, isUnlocked, lang } = useSSContext()

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    function handleDragEnd(e) {
        const {active, over} = e;
        if (active.id !== over.id) {
            const currentIdList = syncStorage.stockedseries.map(elem => { return (elem.seriesID ? elem.seriesID.toString() : elem.id)});
            const oldIndex = currentIdList.indexOf(active.id);
            const newIndex = currentIdList.indexOf(over.id);
            const stockArrayCopy = syncStorage.stockedseries.slice()
            const sortAfter = arrayMove(stockArrayCopy, oldIndex, newIndex);
            setSyncStorageValue("stockedseries", sortAfter)
        }
    }

    if (syncStorage.stockedseries) {
        return <div className={"stockedserieslist-container" + " " + (isUnlocked ? "stocklist-unlocked" : "")}>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={syncStorage.stockedseries ? syncStorage.stockedseries.map(elem => { return (elem.seriesID ? elem.seriesID.toString() : elem.id) }) : []}
                    strategy={verticalListSortingStrategy}
                    id="root-sortable"
                >
                    <CreateRowList array={syncStorage.stockedseries}/>
                </SortableContext>
            </DndContext>
        </div>
    } else {
        return <span>{lang.NO_STOCKED_SERIES}</span>
    }
}


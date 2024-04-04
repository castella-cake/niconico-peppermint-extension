import { DndContext, KeyboardSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";

import { useSSContext } from "./SSContext"
import { removeFolder } from "./seriesManage";
import { CreateRowList } from './StockedSeriesList';
import { useState } from 'react';

import { MdOutlineEdit, MdDeleteOutline, MdOutlineExpandLess, MdOutlineExpandMore, MdOutlineFolder } from "react-icons/md"
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// フォルダー項目。
// 与えられたIDリストを使用してストック項目を抽出し、並び替え可能なCreateRowListとして表示します。
// 操作: このフォルダーを削除, フォルダー編集モーダルを開く
export function FolderRow(props) {
    const { setFCEditId, isUnlocked, setIsFolderCreateWindowVar, lang, syncStorage, setSyncStorageValue } = useSSContext()
    const elem = props.folderinfo
    const folderContent = props.contents

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.id.toString(), disabled: !isUnlocked })
    const Style = { transform: CSS.Translate.toString(transform), transition, borderLeft: "4px solid var(--textcolor3)" }
    const [ isOpen, setIsOpen ] = useState(false)

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

    function removeFolder(folderId) {
        if (syncStorage.stockedseries != undefined && syncStorage.stockedseries.findIndex(elem => elem.id === folderId) != -1) {
            const newStock = syncStorage.stockedseries.filter(obj => obj.id !== folderId);
            setSyncStorageValue("stockedseries", newStock)
        }
    }

    // 後はリストをこの関数で作ってもらう
    return <div className="stockedseries-row stockedseries-row-folder" key={elem.id} ref={setNodeRef} style={Style} {...attributes} {...listeners}>
        <div className="serieslink-container">
            <div className="stockedseries-folder-title" style={!isUnlocked ? {flexGrow: 1} : {}}><MdOutlineFolder style={{ fontSize: 16 }}/>{elem.name}</div>
            {!isUnlocked && <button type="button" onClick={() => {setIsOpen(!isOpen)}} className="stockedseries-folder-openbutton">
                { isOpen ? <>{lang.CLOSE_FOLDER}<MdOutlineExpandLess/></> : <>{lang.OPEN_FOLDER}<MdOutlineExpandMore/></> }
            </button>}
            <button className="stockedseries-row-actionbutton" onClick={() => {setFCEditId(elem.id);setIsFolderCreateWindowVar(true)}} title={lang.EDIT_FOLDER_TITLE}><MdOutlineEdit /></button>
            <button className="stockedseries-row-actionbutton" onClick={() => {removeFolder(elem.id)}} title={lang.REMOVE_FOLDER_TITLE}><MdDeleteOutline /></button>
        </div>
        <div className="stockedseries-folder-details" style={(!isOpen && !isUnlocked) ? {display: "none"} : {}}>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={folderContent ? folderContent.map(elem => { return elem.seriesID.toString() }) : []}
                    strategy={verticalListSortingStrategy}
                    id={`${elem.id}-sortable`}
                >
                    <CreateRowList array={folderContent} isfolder={true} folderid={elem.id} folderindex={props.index}/>
                </SortableContext>
            </DndContext>
        </div>
    </div>
}
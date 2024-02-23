import { useState, useEffect } from "react";
import { getSyncStorageData } from "../storageControl";
import CreateSeriesStockBlock from "./seriesStock";
import lang from "../../../langs/ja.json";
import CreateQuickOption from "./QuickOptions";

//import { EditOutlined, DoneOutlined } from '@mui/icons-material';
//import DoneOutlined from '@mui/icons-material/DoneOutlined';
import { MdOutlineEdit, MdOutlineDone } from "react-icons/md"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

function CreateDashboardUI() {
    const [ syncStorage, setSyncStorageVar ] = useState({})
    useEffect(() => {
        async function setStorage() {
            setSyncStorageVar(await getSyncStorageData)
        } 
        setStorage()
    }, [])

    function setSyncStorageValue(name, value) {
        setSyncStorageVar(current => {
            return {
                ...current,
                [name]: value
            }
        })
        chrome.storage.sync.set({ [name]: value })
    }

    const dashboardBlocks = { quickoption: <CreateQuickOption/>, seriesstock: <CreateSeriesStockBlock/> }
    const dashboardSortList = ( syncStorage.dashboardsortlist ? syncStorage.dashboardsortlist : [{ name: "quickoption", isHidden: false }, { name: "seriesstock", isHidden: false }])
    const dashboardDNDId = dashboardSortList.map(elem => { return elem.name })
    const [isEditMode, setIsEditMode] = useState(false)

    // #region dnd define
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    function handleDragEnd(e) {
        const {active, over} = e;
        if (active.id !== over.id) {
            const oldIndex = dashboardDNDId.indexOf(active.id);
            const newIndex = dashboardDNDId.indexOf(over.id);
            const sortAfterList = arrayMove(dashboardSortList, oldIndex, newIndex);
            setSyncStorageValue("dashboardsortlist", sortAfterList)
        }
    }
    // #endregion

    function setHiddenState(blockname, isHidden) {
        const afterList = dashboardSortList.map(elem => {
            if ( elem.name == blockname ) {
                return { name: elem.name, isHidden: isHidden }
            } else {
                return elem
            }
        })
        setSyncStorageValue("dashboardsortlist", afterList)
    }

    function DraggableList() {
        return dashboardSortList.map((elem) => {
            const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.name, disabled: !isEditMode })
            const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
            if ( Object.keys(dashboardBlocks).includes(elem.name) ) {
                return <div key={elem.name} className="dashboard-draggablecontainer" ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                    { isEditMode ? <div className="block-container"><h2 className="block-title">{lang.DASHBOARD_TITLES[elem.name]}<label><input type="checkbox" checked={elem.isHidden} onChange={(e) => {setHiddenState(e.currentTarget.attributes.getNamedItem("blockname").nodeValue, e.currentTarget.checked)}} blockname={elem.name}/>非表示</label></h2></div> : ( !elem.isHidden && dashboardBlocks[elem.name] ) }
                </div>
            }
        })
    }


    return <div className={isEditMode ? "dashboard-container db-unlocked" : "dashboard-container"}>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext
                items={dashboardDNDId}
                strategy={verticalListSortingStrategy}
            >
                <DraggableList/>
            </SortableContext>
        </DndContext>

        <button type="button" className="dashboard-editbutton" onClick={() => {setIsEditMode(!isEditMode)}}>{isEditMode ? <><MdOutlineDone/> 編集を終了</> : <><MdOutlineEdit/> ダッシュボードを編集</>}</button>
    </div>
}

export default CreateDashboardUI;
import { useState } from "react";
import CreateSeriesStockBlock from "./seriesStock";
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
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import CreateNicorepoUI from "./nicorepoUI";
import { useStorageContext } from "./extensionHook";
import { useLang } from "./localizeHook";

function CreateDashboardUI() {
    const lang = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()

    const dashboardBlocks = { quickoption: <CreateQuickOption/>, seriesstock: (syncStorage.enableseriesstock ? <CreateSeriesStockBlock/> : <></>), nicorepo: <CreateNicorepoUI isrecentblock={true} displaylimit={5}/> }
    const [isChanged, setIsChanged] = useState(false);
    const dashboardSortList = ( (syncStorage.dashboardsortlist && syncStorage.dashboardsortlist.length == Object.keys(dashboardBlocks).length) ? syncStorage.dashboardsortlist : [{ name: "quickoption", isHidden: false }, { name: "seriesstock", isHidden: false }, { name: "nicorepo", isHidden: true }])
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
            setIsChanged(true)
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
        setIsChanged(true)
    }

    function DraggableList() {
        return dashboardSortList.map((elem) => {
            const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.name, disabled: !isEditMode })
            const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
            if ( Object.keys(dashboardBlocks).includes(elem.name) ) {
                return <div key={elem.name} className="dashboard-draggablecontainer" ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                    { isEditMode ? <div className="block-container"><h2 className="block-title"><span style={{ color: "var(--textcolor3)", fontSize: 20, marginRight: 4 }}>::</span>{lang.DASHBOARD_TITLES[elem.name]}<label><input type="checkbox" checked={elem.isHidden} onChange={(e) => {setHiddenState(e.currentTarget.attributes.getNamedItem("blockname").nodeValue, e.currentTarget.checked)}} blockname={elem.name}/>非表示</label></h2></div> : ( !elem.isHidden && dashboardBlocks[elem.name] ) }
                </div>
            }
        })
    }


    return <div className={isEditMode ? "dashboard-container db-unlocked" : "dashboard-container"}>
        { (!syncStorage.quickpaneltipisclosed) && <div className="nothing-here">
            <div className="nothing-here-head">:o</div>
            <div style={{whiteSpace: "pre-wrap"}}>{lang.QUICKPANEL_FIRST_TIP}</div>
            <button type="button" className="nothing-here-discard" onClick={() => {setSyncStorageValue("quickpaneltipisclosed", true)}}>{lang.CLOSE}</button>
        </div>}
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
        <button type="button" className="dashboard-editbutton" onClick={() => {
            setIsEditMode(!isEditMode)
        }}>{isEditMode ? <><MdOutlineDone style={{fontSize: 14}}/> {lang.EDITBUTTON_TITLE_EDITOFF}{isChanged && lang.CLICK_TO_RELOAD}</> : <><MdOutlineEdit style={{fontSize: 14}}/> {lang.DASHBOARD_EDIT}</>}</button>
    </div>
}

export default CreateDashboardUI;
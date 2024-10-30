import { ReactNode, useState } from "react";
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
    DragEndEvent,
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
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useLang } from "@/hooks/localizeHook";
import { useStorageContext } from "@/hooks/extensionHook";

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
    return <div style={{ background: "var(--bgcolor3)", color: "var(--textcolor3)", borderRadius: 4, padding: 8, fontSize: 13 }}>
        このブロックの表示中に重大なエラーが発生しました。<br/>
        {error.message}
    </div>
}

function ComponentFallback({ children }: { children: ReactNode }) {
    return <ErrorBoundary fallbackRender={FallbackComponent}>
        { children }
    </ErrorBoundary>
}

function DraggableList({ dashboardSortList, dashboardBlocks, setHiddenState, isEditMode }: { dashboardSortList: any[], dashboardBlocks: any, setHiddenState: (blockname: string, isHidden: boolean) => void, isEditMode: boolean}) {
    const lang = useLang()
    return dashboardSortList.map((elem) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: elem.name, disabled: !isEditMode })
        const dndStyle = { transform: CSS.Translate.toString(transform), transition, }
        if ( Object.keys(dashboardBlocks).includes(elem.name) ) {
            return <div key={elem.name} className="dashboard-draggablecontainer" ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>
                { isEditMode ? <div className="block-container">
                    <h2 className="block-title">
                        <span style={{ color: "var(--textcolor3)", fontSize: 20, marginRight: 4 }}>::</span>{lang.DASHBOARD_TITLES[elem.name as keyof typeof lang.DASHBOARD_TITLES]}
                        <label>
                            <input type="checkbox" checked={elem.isHidden} onChange={(e) => {
                                if (e.currentTarget.attributes.getNamedItem("block-name")) {
                                    const nodeValue = e.currentTarget.attributes.getNamedItem("block-name")!.nodeValue
                                    if (typeof nodeValue === "string") setHiddenState(nodeValue, e.currentTarget.checked)
                                }
                            }} block-name={elem.name}/>非表示
                        </label>
                    </h2>
                </div> : 
                ( !elem.isHidden && dashboardBlocks[elem.name] ) }
            </div>
        }
    })
}

function CreateDashboardUI() {
    const lang = useLang()
    const { syncStorage, setSyncStorageValue } = useStorageContext()

    const dashboardBlocks = { quickoption: <ComponentFallback><CreateQuickOption/></ComponentFallback>, seriesstock: (syncStorage.enableseriesstock ? <ComponentFallback><CreateSeriesStockBlock/></ComponentFallback> : <></>) }
    const dashboardSortList = ( (syncStorage.dashboardsortlist && syncStorage.dashboardsortlist.length == Object.keys(dashboardBlocks).length) ? syncStorage.dashboardsortlist : [{ name: "quickoption", isHidden: false }, { name: "seriesstock", isHidden: false }])
    const dashboardDNDId = dashboardSortList.map((elem: any) => { return elem.name })
    const [isEditMode, setIsEditMode] = useState(false)

    // #region dnd define
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    function handleDragEnd(e: DragEndEvent) {
        const {active, over} = e;
        if (over && active.id !== over.id) {
            const oldIndex = dashboardDNDId.indexOf(active.id);
            const newIndex = dashboardDNDId.indexOf(over.id);
            const sortAfterList = arrayMove(dashboardSortList, oldIndex, newIndex);
            setSyncStorageValue("dashboardsortlist", sortAfterList)
        }
    }
    // #endregion

    function setHiddenState(blockname: string, isHidden: boolean) {
        const afterList = dashboardSortList.map((elem: any) => {
            if ( elem.name == blockname ) {
                return { name: elem.name, isHidden: isHidden }
            } else {
                return elem
            }
        })
        setSyncStorageValue("dashboardsortlist", afterList)
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
                <DraggableList setHiddenState={setHiddenState} dashboardSortList={dashboardSortList} dashboardBlocks={dashboardBlocks} isEditMode={isEditMode}/>
            </SortableContext>
        </DndContext>
        <button type="button" className="dashboard-editbutton" onClick={() => {
            setIsEditMode(!isEditMode)
        }}>{isEditMode ? <><MdOutlineDone style={{fontSize: 14}}/> {lang.EDITBUTTON_TITLE_EDITOFF}</> : <><MdOutlineEdit style={{fontSize: 14}}/> {lang.DASHBOARD_EDIT}</>}</button>
    </div>
}

export default CreateDashboardUI;
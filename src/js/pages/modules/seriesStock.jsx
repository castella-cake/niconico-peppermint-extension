import { useEffect, useState, useRef, memo, useMemo, createContext, useContext } from "react";
import { useStorageContext, useSyncStorage } from "./extensionHook"
import { linkAction } from "../../modules/actions";

import { MdOutlineEdit, MdOutlineEditOff, MdDeleteOutline, MdOutlinePlayArrow, MdOutlineSkipNext, MdOutlineExpandLess, MdOutlineExpandMore, MdOutlineCreateNewFolder, MdOutlineDriveFileMove, MdOutlineFolder } from "react-icons/md"
import { SeriesStockRow } from "./seriesStock/StockedSeriesList";
import { CreateFolderModal } from "./seriesStock/CreateFolderModal";
import { AvailableSeriesRow } from "./seriesStock/AvailableSeries";
import { SSProvider, useSSContext } from "./seriesStock/SSContext";

export function CreateSeriesStockBlock() {
    return <div className="block-container">
        <SSProvider>
            <BlockContent/>
        </SSProvider>
    </div>
}

function BlockContent() {
    const {isUnlocked, setIsUnlockedVar, isFolderCreateWindow, setIsFolderCreateWindowVar, syncStorage, lang} = useSSContext()
    if ( isFolderCreateWindow ) {
        document.body.style.overflow = "hidden"
    } else {
        document.body.style.overflow = "unset"
    }
    return <>
        <h2 className="block-title">
            {`${lang.SERIES_STOCK_TITLE} (${(syncStorage.stockedseries ?? []).length})`}
            <button className="block-title-actionbutton" title={isUnlocked ? lang.EDITBUTTON_TITLE_EDITOFF : lang.EDITBUTTON_TITLE_TOEDITMODE} type="button" onClick={() => { setIsUnlockedVar(!isUnlocked) }}>{isUnlocked ? <MdOutlineEditOff style={{ fontSize: 22 }} /> : <MdOutlineEdit style={{ fontSize: 22 }} />}</button>
            <button className="block-title-actionbutton" title={lang.ADD_FOLDER} type="button" onClick={() => { setIsFolderCreateWindowVar(!isFolderCreateWindow) }}><MdOutlineCreateNewFolder style={{ fontSize: 22 }}/></button>
        </h2>
        <AvailableSeriesRow/>
        <SeriesStockRow/>
        { isFolderCreateWindow && <CreateFolderModal/>}
    </>
}


export default CreateSeriesStockBlock;
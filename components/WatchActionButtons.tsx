import { useState } from "react";
import { IconCategory } from "@tabler/icons-react";
import PastLogLoader from "./PastLogLoader";
import SeriesStockButton from "./SeriesStockButton";
import "./WatchActionButtons.styl";

type WatchActionButtonsProps = {
    enablePastLogLoader: boolean;
};

export default function WatchActionButtons({ enablePastLogLoader }: WatchActionButtonsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    function handleToggle() {
        setIsOpen((prev) => !prev);
    }

    return (
        <div ref={setContainer} className="watch-action-buttons" data-is-open={isOpen}>
            <button
                type="button"
                className="watch-action-trigger"
                aria-expanded={isOpen}
                aria-controls="past-log-loader"
                title={isOpen ? "アクションを閉じる" : "アクションを開く"}
                onClick={handleToggle}
            >
                <IconCategory />
            </button>
            <div className="watch-action-content">
                <div className="past-log-loader-wrapper" id="past-log-loader">
                    {enablePastLogLoader && <PastLogLoader container={container} isActionOpen={isOpen} />}
                    <SeriesStockButton />
                </div>
            </div>
        </div>
    );
}

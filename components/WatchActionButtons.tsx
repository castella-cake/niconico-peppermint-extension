import { useState } from "react";
import { IconCategory } from "@tabler/icons-react";
import PastLogLoader from "./PastLogLoader";
import "./WatchActionButtons.styl";

export default function WatchActionButtons() {
    const [isOpen, setIsOpen] = useState(false);

    function handleToggle() {
        setIsOpen((prev) => !prev);
    }

    return (
        <div className="watch-action-buttons" data-is-open={isOpen}>
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
                    <PastLogLoader />
                </div>
            </div>
        </div>
    );
}

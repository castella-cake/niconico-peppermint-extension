import { useEffect, useState } from "react";
import { IconHistory } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import PastLogLoaderPopover from "./PastLogLoaderPopover";

type PastLogLoaderProps = {
    container: HTMLElement | null;
    isActionOpen: boolean;
};

export default function PastLogLoader({ container, isActionOpen }: PastLogLoaderProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
        if (!isActionOpen) {
            setIsPopoverOpen(false);
        }
    }, [isActionOpen]);

    useEffect(() => {
        if (!isPopoverOpen) return;

        function handleDocumentMouseDown(event: MouseEvent) {
            if (!(event.target instanceof Node)) return;
            if (container && container.contains(event.target)) return;
            setIsPopoverOpen(false);
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsPopoverOpen(false);
            }
        }

        document.addEventListener("mousedown", handleDocumentMouseDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleDocumentMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPopoverOpen, container]);

    function handleToggle() {
        setIsPopoverOpen((prev) => !prev);
    }

    return (
        <>
            <button
                type="button"
                className="watch-action-button"
                title="過去ログローダーを開く"
                aria-expanded={isPopoverOpen}
                onClick={handleToggle}
            >
                <IconHistory />
                <span>過去ログ</span>
            </button>
            {isPopoverOpen && container && createPortal(
                <PastLogLoaderPopover />,
                container
            )}
        </>
    );
}

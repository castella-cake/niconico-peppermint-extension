import { useEffect, useMemo, useState, useId } from "react";
import "./PastLogLoaderPopover.styl";

function formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatTimeForInput(date: Date): string {
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
}

function formatDateTimeForDisplay(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}/${m}/${d} ${h}:${min}`;
}

function getSmId(): string | null {
    if (!location.pathname.startsWith("/watch/")) return null;
    return location.pathname.replace("/watch/", "");
}

function getCurrentLogData(): { when: number } | undefined {
    const params = new URLSearchParams(location.search);
    const pastLog = params.get("past_log");
    if (!pastLog) return undefined;
    const when = Number(pastLog);
    if (Number.isNaN(when)) return undefined;
    return { when };
}

function getDefaultDate(): Date {
    const currentLogData = getCurrentLogData();
    if (currentLogData) {
        return new Date(currentLogData.when * 1000);
    }
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return date;
}

export default function PastLogLoaderPopover() {
    const dateInputId = useId();
    const timeInputId = useId();

    const smId = useMemo(() => getSmId(), []);
    const currentLogData = useMemo(() => getCurrentLogData(), []);
    const currentLogDate = useMemo(() => {
        if (!currentLogData) return null;
        return new Date(currentLogData.when * 1000);
    }, [currentLogData]);

    const defaultDate = useMemo(() => getDefaultDate(), []);
    const [dateInput, setDateInput] = useState(formatDateForInput(defaultDate));
    const [timeInput, setTimeInput] = useState(formatTimeForInput(defaultDate));

    useEffect(() => {
        if (currentLogDate) {
            setDateInput(formatDateForInput(currentLogDate));
            setTimeInput(formatTimeForInput(currentLogDate));
        }
    }, [currentLogDate]);

    const isInvalidDateTime = useMemo(() => {
        if (!dateInput || !timeInput) return true;
        const [year, month, day] = dateInput.split("-").map(Number);
        const [hours, minutes] = timeInput.split(":").map(Number);
        const selectedDate = new Date(year, month - 1, day, hours, minutes);
        const now = new Date();
        return selectedDate > now;
    }, [dateInput, timeInput]);

    function handleConfirm() {
        if (isInvalidDateTime || !smId) return;
        const [year, month, day] = dateInput.split("-").map(Number);
        const [hours, minutes] = timeInput.split(":").map(Number);
        const selectedDate = new Date(year, month - 1, day, hours, minutes);
        const epoch = Math.floor(selectedDate.getTime() / 1000);
        window.location.href = `${location.origin}/watch/${smId}?past_log=${epoch}`;
    }

    function handleReload() {
        const url = new URL(location.href);
        url.searchParams.delete("past_log");
        window.location.href = url.toString();
    }

    const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

    return (
        <div className="pmw-comment-timemachine-container">
            <div className="pmw-comment-timemachine-title">
                <span>過去ログローダー</span>
                <button
                    type="button"
                    className="pmw-comment-timemachine-reload"
                    onClick={handleReload}
                >
                    現代に戻る
                </button>
            </div>

            <div className="pmw-comment-timemachine-content">
                <div className="pmw-comment-timemachine-input-container">
                    <label htmlFor={`${dateInputId}-date`}>日付</label>
                    <input
                        id={`${dateInputId}-date`}
                        type="date"
                        value={dateInput}
                        max={todayString}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="pmw-comment-timemachine-input"
                    />
                </div>
                <div className="pmw-comment-timemachine-input-container">
                    <label htmlFor={`${timeInputId}-time`}>時刻</label>
                    <input
                        id={`${timeInputId}-time`}
                        type="time"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="pmw-comment-timemachine-input"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleConfirm}
                    aria-disabled={isInvalidDateTime}
                    className="pmw-comment-timemachine-confirm"
                >
                    読み込む
                </button>
            </div>

            {currentLogDate && (
                <div className="pmw-comment-timemachine-currentindicator" data-haslog="true">
                    {formatDateTimeForDisplay(currentLogDate)}
                    {" "}
                    時点の過去ログを表示中
                </div>
            )}

            <div className="pmw-comment-timemachine-description">
                past_logクエリを付与してページを再読み込みします。
            </div>
        </div>
    );
}

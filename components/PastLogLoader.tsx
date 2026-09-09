import { IconHistory } from "@tabler/icons-react";
import "./PastLogLoader.styl";

export default function PastLogLoader() {
    function handleClick() {
        // noop: 将来的に過去ログローダーを開く処理を実装する
    }

    return (
        <button
            type="button"
            className="past-log-loader-button"
            title="過去ログローダーを開く"
            onClick={handleClick}
        >
            <IconHistory />
            <span>過去ログ</span>
        </button>
    );
}

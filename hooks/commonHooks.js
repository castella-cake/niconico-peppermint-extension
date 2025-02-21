import { useEffect, useRef } from "react"

export function useInterval(callback, delayMs) {
    // 渡されたコールバックでRef作成
    const callbackRef = useRef(callback)
    // callbackが更新されたりしたらRef更新
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])
    useEffect(() => {
        if (delayMs < 0) return;
        // 新しい関数でRefの関数を実行
        const tick = () => { callbackRef.current() } 
        const id = setInterval(tick, delayMs)
        // 終わったらこれも切る
        return () => {
            clearInterval(id);
        };
    }, [delayMs])
}
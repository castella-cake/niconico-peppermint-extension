import { useEffect, useRef } from "react"

export function useInterval(callback, ms) {
    // 渡されたコールバックでRef作成
    const callbackRef = useRef(callback)
    // callbackが更新されたりしたらRef更新
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])
    useEffect(() => {
        // 新しい関数でRefの関数を実行
        const tick = () => { callbackRef.current() } 
        const id = setInterval(tick, ms)
        // 終わったらこれも切る
        return () => {
            clearInterval(id);
        };
    }, [])
}
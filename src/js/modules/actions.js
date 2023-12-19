function linkAction(e) {
    // 現在のタブがニコニコ動画の場合はそのタブで開き、そうでない場合は新しいタブで開きます。
    // aのonClickに引数も含めてそのまま渡すことで動作します。
    // イベントを中止してこっちで代行する
    e.preventDefault()
    // メッセージ送信
    let openLinkMsg = new Promise((resolve) => chrome.runtime.sendMessage({ "type": "openThisNCLink", "href": this.href }, resolve))
    openLinkMsg.then(res => {
        // これはとにかく開けるようにするためのフォールバック用
        if (res.status != true) {
            // NGだったらwindow.openにフォールバック
            window.open(this.href)
            window.close()
        } else {
            // OKだったらclose
            window.close()
        }
    })
}

module.exports = { linkAction }
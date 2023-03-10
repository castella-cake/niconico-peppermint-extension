# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2023/03/09

### Added
- クレジットページにSpecial Thanksを追加

### Changed
- 設定画面のフォルダー名を``pages`` に変更
- 設定画面内での呼び名を、 ``PepperMintPlus`` から ``PepperMint+`` に変更
- ポップアップの設定画面のデフォルト幅を``360px`` から ``480px`` に変更
- シリーズストックの管理画面の幅を``560px`` に変更
- 法的問題を避けるためにアイコンを一から書き直したものに変更

### Fixed
- NicoboxUI/シアターUIで、ニコニ貢献をリサイズするように修正
- 設定画面の外部リンクを新しいタブで開くように修正
- 動画トップの「フォロー中の新着動画」のユーザー名を明瞭化
- ページ内UIで、ストック中のシリーズがはみ出る問題を修正 ( #5 )
- シリーズの管理画面でシリーズを保存すると、シリーズIDとシリーズ名以外が消滅する問題を修正
- シアターUI/NicoboxUIで、投稿者用メニューの表示が原因でメインの表示が崩れる問題を修正
- 拡張機能との互換性を修正
- シアターUIのビデオサイズに関する修正
- NicoboxUIが有効の場合は、シアターUIの``21:9に拡大``ボタンを表示しないように修正
- 動画トップ2カラムでニコニ広告行に対してflexを追加し、はみ出さないように修正

### Removed
- 16x16のアイコンを削除

## [1.0.0] - 2023/02/22

### Added
- ``ショートカットアシスト`` を追加
- ``視聴ページテーマ`` に ``原宿風`` を追加

### Changed
- 名称を``Niconico-PepperMint`` から ``Niconico-PeppermintPlus`` に変更
- 設定画面を拡張機能管理から開いた場合に幅を設定するように
- 設定画面のページ移動にアニメーションを追加
- 設定画面のダークモード対応を一部変更
- 設定画面のカラーを[Acorn]準拠に変更
- ニコニコ生放送でダークモードのコメント色を一部変更
- 一部のダークモードCSSを統合

### Fixed
- 動画サイズに関する問題を修正
- spwatchリダイレクトが場合によっては動作しない問題を修正
- ニコニコ生放送でダークモードが動作しない場合がある問題を修正
- ダークモードの設定を一度も触ったことがない場合にニコニコ生放送の表示が色がおかしくなる問題を修正

## [0.8.0] - 2023/02/15

### Added
- ``クリーンな投稿者表示``を追加
- ダークモードをブラウザーの設定に追従可能に

### Changed
- ``サポーターボタンを隠す`` をHideセクションに移動
- シアターUIでプレイヤーパネルが非表示の場合に応じてプレイヤーサイズを変更するように変更

### Fixed
- 適切でない変数宣言を``let``に置き換え
- ``プレイヤーテーマ``機能で、プレイヤースタイルが適用されない問題を修正
- シアターUIをダークモード無効の状態で使用した場合に、プレイヤーパネルの視覚的な問題を修正

## [0.7.0] - 2023/02/15

### Added
- ``コメント行``機能を追加

### Changed
- コードの可読性を向上
- 設定画面の文章を一部変更
- READMEにChromeストアに関する記述を追加

### Removed
- 消し忘れコードを削除

## [0.6.0] - 2023/02/14

### Added
- 「ニコニコ大百科で検索」機能を追加  
ニコニコ動画内に限らず、全てのサイト内で単語をニコニコ大百科で検索します。  
検索したい単語を選択したら右クリックして、``ニコニコ大百科で <選択した内容> を検索``をクリックするだけで検索できます。  
- オプションを拡張機能の管理からも変更可能に
- 新バージョンリリース用のファイルを作成する``create.bat``を作成

### Changed
- オプションのタイトル表示を変更

## [0.5.0] - 2023/02/13

### Added
- 大百科向け機能を追加
- ``サポーターボタンを隠す`` 機能を追加
- NicoboxUIのトグル時に簡易アニメーションを追加
- ``ビジュアルパッチ`` にTabブラウジングに配慮したスタイルを追加
- 設定のインポート/エクスポート機能を追加
- 設定のリセット機能を追加

### Changed
- アイコンを変更
- 設定画面のselectにスタイルシートを適用
- READMEに自動更新に関する記述を追加
- ダークモードをiframeに部分対応
- ダークモードで動画トップのアイコンを白に変更するように
- ダークモードで動画トップのジャンル選択を明瞭化
- PepperMintのウィンドウは、ウィンドウ外をクリックした際に自動的に閉じるように
- 視聴ページからシリーズをストックした時、自動的に次の動画と最後に見た動画を保存するように
- シリーズストックのfunctionをPromiseに変更

### Fixed
- ユーザーページ内のダークモードサポートを改善(いいね履歴,視聴履歴)
- ダークモードで視聴ページのギフトのhoverを修正
- サポートのデバッグストレージ情報をfocusでも表示するように
- シアターUIで再生ボタンのヒントがシークバーに隠れる問題を修正
- NicoboxUIでプレイヤーボタンの色に関する問題を修正
- 広告ブロッカーを使用しない環境で2カラム動画トップを使用すると、ランキングに広告が表示されはみ出す問題を解決

### Removed
- AboutページのSupportセクション  
ストレージ表示が設定のインポート/エクスポートに移動したため。
- 16pxアイコンはツールバーアイコンとして使用されなくなりました

## [0.4.0] - 2023-02-03

### Added
- ``動画トップを2カラムで表示``を追加
- ``カスタム動画トップ``を追加
- ``プレイヤーテーマ``に``RC1``を追加
- ``ビジュアルパッチ``を追加  
角丸の混合を軽減したり、line-heightの未指定による文字の切れを軽減します。
- ``PepperMintについて``ページを追加
- ``spwatchリダイレクト``を追加  
spニコニコ動画の視聴ページにアクセスした際に、自動でPC版ニコニコ動画にリダイレクトします。

### Fixed
- パフォーマンス面の軽微な改善
- ``新しいタブで開く``を使用してページを開いた際に、ダークモードが適用されない場合があるバグを改善
- ユーザーページのダークモードサポートを改善(iframe is still not supported at this time)
- 動画のダウンロードボタンを表示した際、視聴方式がHTTPの場合にのみhrefを設定するように変更
- ``視聴ページ上のイベント告知バナーを隠す``が隠されなかった問題を修正(やっぱり)
- NicoboxレイアウトでVideoSymbolがリサイズされず、プレイヤーを操作できない問題を修正
- ``ロック中のタグをハイライト``がシアターUIとNicoboxUIでも使用できるように変更
- Chromium系ブラウザで発生したPepperMintポップアップの誤ったmarginを修正

## [0.3.1] - 2023-01-21

### Fixed
- Chromium系ブラウザで発生したバグを修正
- コメントレンダラーとビデオシンボルの大きさが正しくない問題を修正
- シアターUIの設定がデフォルトでONになっていた問題を修正
- シアターUIのヘッダーが正しく適用されなかった問題を修正

## [0.3.0] - 2023-01-21

### Added
- ``新着通知に赤丸を表示``を追加
- シアターモードの追加
- シリーズストック機能の追加  
シリーズを保存し、動画トップからいつでもアクセスできるようにします
- 動画ダウンロード機能の追加
- 大百科レス評価関連の機能を追加(高評価をニコるに変更/評価数の削除)
- ウォーターマークの追加

### Fixed
- CSS追加関連のfunctionの変更
- その他コードの改善
- ボタン位置を修正
- NicoboxUIのアスペクト比関連を修正

## [0.2.0] - 2023-01-15
### Added
- ``ロック中のタグをハイライト``を追加
- ``プレイヤーテーマ``に``Mint``を追加
- ``ヘッダー背景`` を追加
- ダークモードを追加
- Nicobox風UIを追加

### Changed
- Firefox向けIDの変更

### Removed
- テスト用機能の設定を削除

### Fixed
- ``ニコニコホームの最大幅をニコニコ動画ホームに合わせる`` が適用されない場合がある問題を修正
- storage取得のコードをChromium向けに修正

## 0.1.0 - 2023-01-09

### Added
- スタイルシート追加関連のコードを作成
- ``プレイヤーテーマ``を追加(現在は原宿のみ)
- ``ランキングページのニコニ広告行を隠す``を追加
- ``視聴ページ上のイベント告知バナーを隠す``を追加
- ``フォロー/サポーター/プレ会勧誘を隠す``を追加
- ``マーキーテキストをロゴに置き換え``を追加  
*"Is it legal?" "Yes, it is legal."*

### Removed
- テスト用機能のコードを削除

[Acorn]: https://acorn.firefox.com/latest/acorn.html
[1.1.0]: https://github.com/astella-cake/niconico-peppermint-extension/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/astella-cake/niconico-peppermint-extension/compare/v0.8.0..v1.0.0
[0.8.0]: https://github.com/astella-cake/niconico-peppermint-extension/compare/v0.7.0..v0.8.0
[0.7.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/v0.6.0..v0.7.0
[0.6.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/v0.5.0..v0.6.0
[0.5.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/v0.4.0..v0.5.0
[0.4.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/v0.3.1..v0.4.0
[0.3.1]: https://github.com/castella-cake/niconico-peppermint-extension/compare/v0.3rc...v0.3.1
[0.3.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/cdf30c9..d019f83
[0.2.0]: https://github.com/castella-cake/niconico-peppermint-extension/compare/a7845b0..cdf30c9
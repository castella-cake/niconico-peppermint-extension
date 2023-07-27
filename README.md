# Niconico-PepperMint+

<img src="https://user-images.githubusercontent.com/65476384/227467934-a8654224-6a33-46b0-ba2d-fecd5071519d.png" width="40%"/>

ニコニコ動画を、もっとクールに。  


Niconico-PepperMint+は、「ニコニコ動画をもっとクールに」を目標に開発している、   
主にニコニコ動画向けの視覚的変更やシリーズストックなどの機能を提供する拡張機能です。   
プロジェクトはMITライセンスで提供され、背後の面倒な規約などはありません。   
Chrome Webstore: https://chrome.google.com/webstore/detail/niconico-peppermint+/oeadnodbjplclhibppgkkijomgcgochf   
Firefox Add-ONS: https://addons.mozilla.org/ja/firefox/addon/niconico-peppermint/

# Install
## 安定版を入手
### Firefox
1. https://addons.mozilla.org/ja/firefox/addon/niconico-peppermint/ に行きます
2. ``Firefox に追加`` を押します
3. 画面の手順に従います
4. おわり
### Chrome
1. https://chrome.google.com/webstore/detail/niconico-peppermint/oeadnodbjplclhibppgkkijomgcgochf に行きます
2. ``Chrome に追加`` を押します
3. 画面の手順に従います
4. おわり
## リリースからインストールする
通常使用には自動更新のある安定版を強く推奨します。
### Chrome
1. リリースページに行きます
2. ``-chrome``で終わるzipファイルをダウンロードします
3. zipを解凍します
4. ``chrome://extensions``を開きます
5. 右上のデベロッパーモードを有効化します
6. 「パッケージ化されていない拡張機能を読み込む」をクリックします
7. 解凍したフォルダーを選択します
8. おわり
### Firefox
Firefoxでは、新しいバージョンがある場合自動的にアップデートされます
1. リリースページに行きます
2. xpiファイルをダウンロードします(この時点でインストールダイアログが表示された場合は、そのまま画面の手順に従えば終わりです)
3. xpiファイルをfirefoxにD&Dします
4. 画面の手順に従います
5. おわり
## ソースコードからインストールする
開発真っ最中のバージョンをインストールする方法です。
### Chrome
1. 緑色のCodeボタンからソースコードをダウンロードします
2. zipを解凍します
3. manifest.jsonを適当な名前にリネームして、manifest_chrome.jsonをmanifest.jsonにリネームします
4. ``chrome://extensions``を開きます
5. 右上のデベロッパーモードを有効化します
6. 「パッケージ化されていない拡張機能を読み込む」をクリックします
7. 解凍したフォルダーを選択します
8. おわり
### Firefox
ここでインストールした拡張機能は、Firefoxを再起動するとなかったことになります  
1. 緑色のCodeボタンからソースコードをダウンロードします
2. ``about:debugging`` を開きます
3. ``この Firefox`` をクリックします
4. ``一時的なアドオンを読み込む...`` をクリックします
5. ダウンロードしたzipファイルを読み込みます
6. おわり

# Build
PepperMint+ v1.6.3以降のソースコードはビルドが必要です。
Node.jsとnpmをインストールしたら、以下のコマンドで依存関係をインストールします:
```
npm install
```
その後、以下のコマンドでgulpを実行します:
```
npm run build
```

# Feature
実装済みの機能/実装予定の機能。
#### Hide
- [x] ランキングページのニコニ広告行を隠す
- [x] 視聴ページ上のイベント告知バナーを隠す
- [x] フォロー/サポーター/プレミアム会員勧誘を隠す
- [x] サポーターボタンを隠す(視聴ページ,全ページ)
- [x] 投稿日時,ジャンル以外のメタデータを隠す
#### WatchPage
- [x] 視聴ページテーマ
    - [x] Mint
    - [x] 原宿風
- [x] プレイヤーテーマ
    - [x] 原宿風
    - [x] RC1風
    - [x] GINZA風
    - [x] Mint
- [x] プレイヤースタイルのオーバーライド
- [x] コメント入力欄行
- [x] マーキーテキストをロゴに置き換え
- [x] ロック中のタグをハイライト
- [x] クリーンな投稿者表示
- [x] ショートカットアシスト
- [x] exCommander
- [x] シアターUI
- [x] Nicobox風UI
- [ ] 動画ダウンロード機能
- [x] 動画記事ボタンを表示
- [x] Misskeyで共有
#### NicoPedia
- [x] 評価数削除
- [x] 最大幅開放
- [x] サイドバーを左に
- [x] 高評価をニコるに変更
- [x] ダークエディター
#### Other
- [x] ニコニコホームの最大幅を動画ホームに合わせる
- [x] 新着通知に赤丸を表示
- [x] 動画トップを2カラムで表示
    - [x] 2カラム表示
    - [x] 画面幅が小さい場合に1カラムに戻す
#### Global
- [x] ダークモード
- [x] ヘッダー背景色の変更
- [x] ビジュアルパッチ
- [x] spwatchリダイレクト
- [x] シリーズストック
    - [x] 追加機能
    - [x] 最後に見た動画/次の動画記録
    - [x] リスト取得機能
    - [x] 新規エピソード通知機能
    - [ ] フォルダー分け機能
- [x] ニコレポ取得
- [ ] お知らせ通知
- [x] カスタム動画トップ

# Progress
- [x] 拡張機能を作成する
- [x] ベースの作成(設定内容を元にCSSを適用するなど)
- [x] メジャー機能をUserStyle版から移植する
- [x] ダークモードをUserStyle版から移植する
- [x] Chromium系との相性を確認する
- [x] マイナー機能をUserStyle版から移植する

# Support
## サービス
Niconico-PepperMintはメインにニコニコ動画の視聴、サブにニコニコ大百科の閲覧や編集にフォーカスを当てています。  
ニコニコ静画(漫画),ニコニコ生放送,ニコニ・コモンズに対する機能拡充も計画しています。  
機能要望などはissueにお願いします。  
## ブラウザー
Niconico-PepperMintはQuantumより後のFirefoxとその派生ブラウザ、そしてChromium系ブラウザをサポートします。  
### 動作確認済みブラウザーの一覧
開発者の意図的に動作することを確認したブラウザー。  
チェックボックスの付いていないブラウザーは、テストしたが何らかの無視できない問題があることを示します。  
#### Firefox
- [x] Firefox 110
- [x] Waterfox 5.1.2
- [x] Floorp 11 (それ以前のバージョンには表示に軽微な問題がありますが、使用には問題ありません)
- [ ] MyPal 68.12.5b (Windows XP/10で動作確認、しかしニコニコ動画側がまともに動いてない模様  
``about:config``で``webextensions.storage.sync.enabled``をtrueに変更する必要があり、対応していないCSSルールがあるためシアターモードが動作せず)
#### Chromium
- [x] Google Chrome 110
- [x] Vivaldi 5.6.2867.62
- [x] Microsoft Edge 110
- [x] Arc

# Donate
開発者への寄付に関しては、Github sponsorsで受け付けています。   
https://github.com/sponsors/castella-cake

# License
Niconico-PepperMint+のライセンスは``MIT License``です。  
詳細は``LICENSE.txt``を確認してください。  

Niconico-PepperMint+には、外部リソースとしてMaterial Iconsを使用している箇所があります。    
Material Iconsは``Apache License 2.0`` のもとで配布されています。  
Apache License 2.0 の文章: https://www.apache.org/licenses/LICENSE-2.0

Niconico-PepperMint+のリリースファイルには、JQuery, JQuery UI, Nord が含まれています。
これらは``MIT License``のもとで配布されています。

Niconico-PepperMint+のリリースファイルにはDOMPurifyが含まれています。
DOMPurifyは``Apache License 2.0``、``Mozilla Public License Version 2.0``のデュアルライセンスで配布されています。
(PepperMint+では``Apache License 2.0``に従います)

外部リソースのライセンスについては、``NOTICE.txt``を参照してください。
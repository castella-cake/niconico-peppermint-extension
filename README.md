# Niconico-PepperMint+

<img src="https://user-images.githubusercontent.com/65476384/227467934-a8654224-6a33-46b0-ba2d-fecd5071519d.png" width="40%"/>

ニコニコ動画を、もっとクールに。  


Niconico-PepperMint+は、「ニコニコ動画をもっとクールに」を目標に開発している、   
主にニコニコ動画向けの視覚的変更やシリーズストックなどの機能を提供する非公式の拡張機能です。   
プロジェクトはMITライセンスで提供され、背後の面倒な規約などはありません。   
Chrome Webstore: https://chrome.google.com/webstore/detail/niconico-peppermint+/oeadnodbjplclhibppgkkijomgcgochf   
Firefox Add-ONS: https://addons.mozilla.org/ja/firefox/addon/niconico-peppermint/

**この拡張機能は非公式のプロジェクトであり、ニコニコやドワンゴとは一切提携していません。**   
もしページレイアウトの崩れなどのバグが発生した場合、まずそれがPepperMint+やその他の拡張機能によって引き起こされたものでないか確認してください。   
この拡張機能で発生した問題は、ニコニコ公式のサポートではなくこのリポジトリの[Issue](https://github.com/castella-cake/niconico-peppermint-extension/issues)に報告してください。

# Install
## ストア版(安定版)を入手
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
**通常使用には自動更新のある安定版を強く推奨します。このインストール方法は、ストアが使用できない場合にのみ使用してください。**
### Chrome
1. リリースページに行きます
2. ``chrome-<バージョン名>``のzipファイルをダウンロードします
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

# Build
PepperMint+ **v1.6.3以降のソースコード**は、ブラウザ上で動作させるためにビルドが必要です。   
Node.jsとnpmをインストールしたら、以下のコマンドで依存関係をインストールします:
```
npm install
```
その後、以下のコマンドでgulpを実行します:
```
npm run build
```
ビルドが正常に終了すると、`builds` フォルダーにバージョン名のフォルダーと、ストア提出用のパッケージが作成されます。   

# Feature
実装済みの機能。実装予定の機能については、Issueを参照してください。
#### Hide
- [x] ランキングページのニコニ広告行を隠す
- [x] 視聴ページ上のイベント告知バナーを隠す
- [x] フォロー/サポーター/プレミアム会員勧誘を隠す
- [x] ヘッダー上のイベント告知を隠す
- [x] サポーターボタンを隠す(視聴ページ,全ページ)
- [x] 投稿日時,ジャンル以外のメタデータを隠す
#### WatchPage
新視聴ページのリリースにより、視聴ページの機能は利用できなくなりました。[#38](https://github.com/castella-cake/niconico-peppermint-extension/issues/38) を確認してください。   
- [ ] 独自視聴ページ
    - [ ] レイアウトカスタマイズ
    - [ ] 新宿レイアウト 
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
- [x] ヘッダー幅を固定
#### Global
- [x] ダークモード
    - [x] ホーム
    - [x] ニコニコ動画 - 視聴全般
    - [x] ニコニコ生放送 - 視聴全般
    - [x] ニコニ貢献 - 部分的なサポート
    - [x] 通知ページ(inform)
    - [ ] ニコニコ静画 - 閲覧全般
    - ~~[ ] ニコニコインフォ~~
- [x] ダークモードカスタムパレット
- [x] ヘッダー背景色の変更
- [x] ビジュアルパッチ
- [x] spwatchリダイレクト
- [x] シリーズストック
    - [x] 追加機能
    - [x] 最後に見た動画/次の動画記録
    - [x] リスト取得機能
    - [x] 新規エピソード通知機能
    - [x] フォルダー分け機能
- [x] カスタム動画トップ

# Support
Niconico-PepperMintはニコニコ動画に対する改変にフォーカスを当てています。   
ダークモードサポートは動画の他に生放送,貢献に一部対応していますが、ニコニコ静画に対するサポートの追加は現状未定です。   
機能要望やバグ報告はIssueにお願いします。  
## ブラウザー
Niconico-PepperMintは最近のFirefoxとその派生ブラウザ、そしてChromium系ブラウザをサポートします。  
ただし、完全な動作には`:has()`のサポートが必要です。(最近のブラウザでは概ねサポートされているはずです)   
PCでの動作を想定した拡張機能のため、スマートフォンでの動作は現状サポートしていません。
### 動作確認済みブラウザーの一覧
開発者の意図的に動作することを確認したブラウザー。  
チェックボックスの付いていないブラウザーは、テストしたが何らかの無視できない問題があることを示します。  
#### Firefox
- [x] Firefox 110
- [x] Waterfox 5.1.2
- [x] Floorp 11 (それ以前のバージョンには表示に軽微な問題がありますが、使用には問題ありません)
- [x] Wolvic 1.6.0
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

Niconico-PepperMint+には、JQuery, JQuery UI, Nord が含まれています。   
これらは``MIT License``のもとで配布されています。   

これら以外にも、リリースファイルにはReactなどのライブラリが含まれています。   
それらのライセンス表示については、リリースファイルの各`<ファイル名>.LICENSE.txt`を参照してください。   
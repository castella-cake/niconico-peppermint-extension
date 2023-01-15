# Niconico-PepperMint Extension版
**UNDER CONSTRUCTION**  
Niconico-PepperMint Extension版は現在試験的なものです。  
重大なパフォーマンスの問題、バグなどが発生する可能性があります。

「ニコニコ動画をちょっとクールに」を目標に開発しているUserCSS「Niconico-PepperMint」  
...を拡張機能化し、UserStyle版を置き換えることを目標に開発している拡張機能。

作者はJavaScript初心者なので、貢献は大歓迎です。  

# How to install
まだReleaseを出してないので仮の手順です。Releaseを出した後に変更します。
### Chromeの場合
1. 緑色のCodeボタンからソースコードをダウンロードします
2. zipを解凍します
3. manifest.jsonを適当な名前にリネームして、manifest_chrome.jsonをmanifest.jsonにリネームします
4. ``chrome://extensions``を開きます
5. 右上のデベロッパーモードを有効化します
6. 「パッケージ化されていない拡張機能を読み込む」をクリックします
7. 解凍したフォルダーを選択します
8. おわり

# Todo
現時点でやらねばならないこと。  
- [x] 拡張機能を作成する
- [x] ベースの作成(設定内容を元にCSSを適用するなど)
- [x] メジャー機能をUserStyle版から移植する
- [x] ダークモードをUserStyle版から移植する
- [x] Chromium系との相性を確認する
- [ ] マイナー機能をUserStyle版から移植する
- [ ] UserStyle版の開発停止

# License
Niconico-PepperMint Extension版のライセンスは``MIT License``です。  
詳細は``LICENSE.txt``を確認してください。  

Niconico-PepperMint内には、Material Iconsを使用している箇所があります。    
Material Iconsは``Apache License 2.0`` のもとで配布されています。  
Apache License 2.0 の文章: https://www.apache.org/licenses/LICENSE-2.0

Niconico-PepperMint内には、JQueryが含まれています。
JQueryは``MIT License``のもとで配布されています。
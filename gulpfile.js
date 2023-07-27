const gulp = require('gulp');
const zip = require('gulp-zip');
const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json'); // package.jsonを読み込む

gulp.task('createVersionFolders', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // バージョン名でフォルダーを作成
    fs.mkdirSync(`./builds/${versionName}/chrome`, { recursive: true });
    fs.mkdirSync(`./builds/${versionName}/firefox`, { recursive: true });

    done();
});

gulp.task('copyFilesFirefox', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // srcフォルダーの内容をfirefoxフォルダーにコピー
    gulp.src('./src/**/*')
        .pipe(gulp.dest(`./builds/${versionName}/firefox`))
        .on('end', done); // copyFilesが完了したらdone()を呼ぶ
});

gulp.task('copyFilesChrome', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // srcフォルダーの内容をchromeフォルダーにコピー
    gulp.src('./src/**/*')
        .pipe(gulp.dest(`./builds/${versionName}/chrome`))
        .on('end', done); // copyFilesが完了したらdone()を呼ぶ

});

gulp.task('renameFiles', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // chromeフォルダー内のmanifest.jsonを削除してからコピーを行う
    fs.unlinkSync(`./builds/${versionName}/chrome/manifest.json`);
    // manifest_chrome.jsonをchromeフォルダー内にコピーし、同時にリネームする
    fs.copyFileSync('./src/manifest_chrome.json', `./builds/${versionName}/chrome/manifest.json`);
    // chromeフォルダー内のmanifest_chrome.jsonを削除
    fs.unlinkSync(`./builds/${versionName}/chrome/manifest_chrome.json`);

    // manifest.jsonをfirefoxフォルダー内に配置
    fs.copyFileSync('./src/manifest.json', `./builds/${versionName}/firefox/manifest.json`);
    // firefoxフォルダー内のmanifest_chrome.jsonを削除
    fs.unlinkSync(`./builds/${versionName}/firefox/manifest_chrome.json`);

    done();
});

gulp.task('compress', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // chromeフォルダーを圧縮
    gulp.src(`./builds/${versionName}/chrome/**/*`)
        .pipe(zip(`chrome_${versionName}.zip`))
        .pipe(gulp.dest('./builds'));

    // firefoxフォルダーを圧縮
    gulp.src(`./builds/${versionName}/firefox/**/*`)
        .pipe(zip(`firefox_${versionName}.zip`))
        .pipe(gulp.dest('./builds'));

    done()
});

// デフォルトタスク
gulp.task('default', gulp.series('createVersionFolders', 'copyFilesChrome', 'copyFilesFirefox', 'renameFiles', 'compress'));

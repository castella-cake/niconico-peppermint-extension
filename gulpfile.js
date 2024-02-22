const gulp = require('gulp');
const zip = require('gulp-zip');
const fs = require('fs');
const path = require('path');
const stylus = require('gulp-stylus');
const fse = require('fs-extra');
const webpack = require('webpack-stream');

const packageJson = require('./package.json'); // package.jsonを読み込む
const webpackConfig = require('./webpack.config');
const bundleJSList = ["./src/js/index.js"]


gulp.task('createVersionFolders', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // buildフォルダーを作成
    fs.mkdirSync(`./builds/`, { recursive: true });

    // バージョン名でフォルダーを作成
    fs.mkdirSync(`./builds/${versionName}/chrome`, { recursive: true });
    fs.mkdirSync(`./builds/${versionName}/firefox`, { recursive: true });

    done();
});

gulp.task('compileStylus', function () {
    // Stylusファイルのコンパイル処理
    return gulp.src(['./src/style/index.styl'])
        .pipe(stylus())
        .pipe(gulp.dest('./dist/style/')); // コンパイルされたCSSファイルをsrcフォルダーに出力
});

gulp.task('compileWebpack', function () {
    // Stylusファイルのコンパイル処理
    return webpack({...webpackConfig, mode: "development"})
        .pipe(gulp.dest('./dist/js'))
});
gulp.task('compileWebpackWithProd', function () {
    // Stylusファイルのコンパイル処理
    return webpack({...webpackConfig, mode: "production"})
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('cleanUp', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得
    // バージョン名のフォルダーが存在する場合は削除する
    const versionFolderPath = path.join(__dirname, `./builds/${versionName}`);
    if (fs.existsSync(versionFolderPath)) {
        fse.removeSync(versionFolderPath)
    }
    done()
})

gulp.task('copyFilesForPrepare', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得
    const destpath = `./dist`
    const distFolderPath = path.join(__dirname, `./dist`);
    if (fs.existsSync(distFolderPath)) {
        fse.removeSync(distFolderPath)
    }
    gulp.src(['./LICENSE.txt','./CHANGELOG.md','./NOTICE.txt','./README.md','./src/manifest.json','./src/manifest_chrome.json'])
        .pipe(gulp.dest(destpath));

    gulp.src(['./src/icons/*'])
        .pipe(gulp.dest(destpath + "/icons"))

    gulp.src(['./src/lib/*'])
        .pipe(gulp.dest(destpath + "/lib"))

    gulp.src(['./src/pages/*'])
        .pipe(gulp.dest(destpath + "/pages"))

    gulp.src(['./src/style/css/**/*.css'])
        .pipe(gulp.dest(destpath + "/style/css"))

    gulp.src(['./src/lang/*'])
        .pipe(gulp.dest(destpath + "/lang"))

    gulp.src(['./src/js/**/*.js'])
        .pipe(gulp.dest(destpath + "/js"))
        .on('end', function () {
            /*const gulp = require('gulp');
            const dependencies = require('gulp-package-dependencies');
            return dependencies()
                .pipe(gulp.dest(`./dist/dist`))
                .on('end', done);*/
            done()
        });
});

gulp.task('copyFilesFirefox', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    gulp.src('./dist/**/*')
        .pipe(gulp.dest(`./builds/${versionName}/firefox`))
        .on('end', done);
});

gulp.task('copyFilesSource', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    gulp.src(['./*.md', './*.js', './*.txt', './*.json'])
        .pipe(gulp.dest(`./builds/${versionName}/source`));

    // srcフォルダーの内容をfirefoxフォルダーにコピー
    gulp.src(['./src/**/*'])
        .pipe(gulp.dest(`./builds/${versionName}/source/src`))
        .on('end', done);
});

gulp.task('copyFilesChrome', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    gulp.src('./dist/**/*')
        .pipe(gulp.dest(`./builds/${versionName}/chrome`))
        .on('end', done);
});

gulp.task('renameFiles', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    // chromeフォルダー内のmanifest.jsonを削除してからコピーを行う
    fs.unlinkSync(`./builds/${versionName}/chrome/manifest.json`);
    // manifest_chrome.jsonをchromeフォルダー内にコピーし、同時にリネームする
    fs.copyFileSync('./dist/manifest_chrome.json', `./builds/${versionName}/chrome/manifest.json`);
    // chromeフォルダー内のmanifest_chrome.jsonを削除
    fs.unlinkSync(`./builds/${versionName}/chrome/manifest_chrome.json`);

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

    // sourceフォルダーを圧縮
    gulp.src(`./builds/${versionName}/source/**/*`)
        .pipe(zip(`source_${versionName}.zip`))
        .pipe(gulp.dest('./builds'));

    done()
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*'], gulp.series('copyFilesForPrepare', 'compileStylus', 'compileWebpack'));
});

// デフォルトタスク
gulp.task('default', gulp.series('cleanUp', 'createVersionFolders', 'copyFilesForPrepare', 'compileStylus', 'compileWebpackWithProd', 'copyFilesChrome', 'copyFilesFirefox', 'copyFilesSource', 'renameFiles', 'compress'));

gulp.task('prep', gulp.series('copyFilesForPrepare', 'compileStylus', 'compileWebpack'));

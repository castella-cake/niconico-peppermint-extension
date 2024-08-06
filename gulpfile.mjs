import gulp from 'gulp'
import zip from 'gulp-zip';
import fs from 'fs';
import path from 'path';
import stylus from 'gulp-stylus';
import fse from 'fs-extra';
import webpack from 'webpack-stream';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import packageJson from './package.json' with { type: "json" };
import webpackConfig from './webpack.config.mjs';

const stylusEndpoints = ['./src/style/index.styl', './src/style/dm_external.styl']


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
    return gulp.src(stylusEndpoints)
        .pipe(stylus())
        .pipe(gulp.dest('./dist/style/')); // コンパイルされたCSSファイルをsrcフォルダーに出力
});

gulp.task('compileWebpack', function () {
    // Stylusファイルのコンパイル処理
    return webpack({...webpackConfig, mode: "development", devtool: "source-map"})
        .pipe(gulp.dest('./dist/js'))
});
gulp.task('compileWebpackWithProd', function () {
    // Stylusファイルのコンパイル処理
    return webpack({...webpackConfig, mode: "production", devtool: false})
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

    gulp.src(['./src/icons/*'], {encoding: false})
        .pipe(gulp.dest(destpath + "/icons"))

    gulp.src(['./src/lib/*'])
        .pipe(gulp.dest(destpath + "/lib"))

    gulp.src(['./src/pages/*'])
        .pipe(gulp.dest(destpath + "/pages"))

    gulp.src(['./src/style/css/**/*.css'])
        .pipe(gulp.dest(destpath + "/style/css"))

    gulp.src(['./src/langs/*'])
        .pipe(gulp.dest(destpath + "/langs"))

    gulp.src(['./src/js/**/*.js', '!./src/js/modules/**/*.js', '!./src/js/pages/modules/**/*.js'])
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

    gulp.src('./dist/**/*', {encoding: false})
        .pipe(gulp.dest(`./builds/${versionName}/firefox`))
        .on('end', done);
});

gulp.task('copyFilesSource', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    gulp.src(['./*.md','./*.mjs', './*.js', './*.txt', './*.json'], {encoding: false})
        .pipe(gulp.dest(`./builds/${versionName}/source`));

    // srcフォルダーの内容をfirefoxフォルダーにコピー
    gulp.src(['./src/**/*'], {encoding: false})
        .pipe(gulp.dest(`./builds/${versionName}/source/src`))
        .on('end', done);
});

gulp.task('copyFilesChrome', function (done) {
    const versionName = packageJson.version; // バージョン情報を取得

    gulp.src('./dist/**/*', {encoding: false})
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
    gulp.src(`./builds/${versionName}/chrome/**/*`, {encoding: false})
        .pipe(zip(`chrome_${versionName}.zip`))
        .pipe(gulp.dest('./builds'));

    // firefoxフォルダーを圧縮
    gulp.src(`./builds/${versionName}/firefox/**/*`, {encoding: false})
        .pipe(zip(`firefox_${versionName}.zip`))
        .pipe(gulp.dest('./builds'));

    // sourceフォルダーを圧縮
    gulp.src(`./builds/${versionName}/source/**/*`, {encoding: false})
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

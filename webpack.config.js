const path = require('path');

module.exports = {
    entry: {
        index: './src/js/index.js'
    },
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: false,
    mode: 'production'
}
const path = require('path');

module.exports = {
    entry: ['./src/js/index.js'],
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: true,
    mode: 'none'
}
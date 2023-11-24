module.exports = {
    entry: {
        index: './src/js/index.js',
        settings: './src/js/settings.jsx'
    },
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: false,
    mode: 'production',
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            { test: /\.jsx$/, loader: "babel-loader", exclude: /node_modules/, options: {
                presets: ["@babel/preset-react"]
            } },
        ],
    },
}
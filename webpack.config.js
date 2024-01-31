module.exports = {
    entry: {
        index: './src/js/index.js',
        index_end: './src/js/index_end.js',
        settings: './src/js/settings.jsx',
        quickpanel: './src/js/quickpanel.jsx',
    },
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: false,
    devtool: "source-map",
    mode: 'development',
    resolve: {
        extensions: [".js", ".jsx", ".json"]
    },
    module: {
        rules: [
            { test: /\.jsx$/, loader: "babel-loader", exclude: /node_modules/, options: {
                presets: ["@babel/preset-react"]
            } },
        ],
    },
}
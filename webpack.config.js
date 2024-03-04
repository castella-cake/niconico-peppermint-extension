const { JsonAccessOptimizer } = require('webpack-json-access-optimizer');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    entry: {
        index: './src/js/index.js',
        index_end: './src/js/index_end.js',
        settings: './src/js/settings.jsx',
        quickpanel: './src/js/quickpanel.jsx',
        credit: './src/js/credit.js',
    },
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: false,
    resolve: {
        extensions: ['.mjs', ".js", ".jsx", ".json", ".styl"]
    },
    module: {
        rules: [
            {
                test: /\.jsx$/, loader: "babel-loader", exclude: /node_modules/
            },
            {
                test: /\.styl$/,
                use: ['style-loader', 'css-loader', 'stylus-native-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.txt$/,
                type: 'asset/source',
                exclude: /node_modules/
            }
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin({ analyzerMode: "static", reportFilename: "./builds/latest_report.html", openAnalyzer: false }),
    ],
    optimization: {
        usedExports: true,
    }
}
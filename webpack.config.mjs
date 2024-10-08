import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
export default {
    entry: {
        index: './src/js/index.js',
        index_end: './src/js/index_end.js',
        settings: './src/js/pages/settings.jsx',
        quickpanel: './src/js/pages/quickpanel.jsx',
        credit: './src/js/credit.js',
    },
    output: {
        filename: '[name].bundle.js', // 出力ファイル名
    },
    watch: false,
    resolve: {
        extensions: ['.mjs', ".js", ".jsx", ".ts", ".tsx", ".json", ".styl"]
    },
    module: {
        rules: [
            /*{
                test: /\.(js|jsx)$/, 
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                },
            },*/
            {
                test: /\.(ts|tsx|js|jsx)$/, 
                exclude: /node_modules/,
                use: [
                    {loader: 'ts-loader'}
                ]
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
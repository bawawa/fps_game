const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
let  env=process.env.NODE_ENV==="development"?"development":"production";

module.exports = {
    entry: './index.ts',
    devtool: 'eval-source-map',
    plugins: [
        new HTMLWebpackPlugin({
            title: "FPS Game",
            minify: { // 压缩HTML文件
                removeComments: true, // 移除HTML中的注释
                collapseWhitespace: true, // 删除空白符与换行符
                minifyCSS: true// 压缩内联css
            },
            inject: 'head',
            template: "./index.html"
        })
    ],
    devServer:{
        static: {
            directory: path.join(__dirname, '../../dist/client'),
        },
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./library/three.module.js')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
    }
};

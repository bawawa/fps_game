const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path');
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    mode: 'development',
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
    devServer: {
        static: {
            directory: path.join(__dirname, './dist/client'),
        },
        hot: true,
    },
})

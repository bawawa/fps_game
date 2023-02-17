const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
let  env=process.env.NODE_ENV==="development"?"development":"production";



const config = {
    mode: env,
    devtool: 'source-map',
    entry: {
        app:"./index.ts"
    },
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
        contentBase: path.join(__dirname, ''),
        clientLogLevel: 'info',
        open:false,  //启动时默认打开浏览器
        host:'localhost', //域名 0.0.0.0局域网可访问
        port:'8080',
        inline:true, //实时更新
    },
    module: { // 所有第三方 模块的配置规则
        rules: [ // 第三方匹配规则
            {
                test: /\.js|jsx$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }, // 千万别忘记添加 exclude 排除项
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            limit:50000,
                            outputPath:"./images",
                            name: '[path][name].[ext]',
                            publicPath: 'assets/images'
                        }
                    }
                ]
            }
        ]
    },
    optimization: {

    },
};

module.exports = config;

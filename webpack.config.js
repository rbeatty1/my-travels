const path = require('path')
    ExtractTextPlugin = require('mini-css-extract-plugin'),
    HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins:[
        new ExtractTextPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),     
        new HTMLWebpackPlugin({
            title: 'Custom Template',
            template: 'index.html',
            hash: true
}),
    ],
    module: {
        rules : [
            // write code for the future, but make it compatible for the past
            {
                test: /\.(js|json)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [["@babel/preset-env", {
                        "useBuiltIns" : 'entry'
                    }]] // convert everything to ES2015
                } 
            },
            // want to bundle your CSS files? i got u fam
            {
                test: /\.css/,
                use: [
                    {
                        loader: ExtractTextPlugin.loader
                    },
                    "css-loader"
                ]
            },
            {
                test: /\.(png|gif)$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "img/[name].[ext]",
                        limit: 1000
                    }
                }]
            },
            {
                test: require.resolve('imports-loader'),
                use : "imports-loader?this=>window"
            }
        ]
    },
    watch: true,
    devServer: {
        // configuration of server that will run upon npm start command
        contentBase: path.resolve(__dirname, 'src'),
        port: 9000
    }
}
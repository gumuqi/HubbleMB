const path = require('path');
const webpack = require('webpack');
// html中替换编译后的js
const HtmlwebpackPlugin = require('html-webpack-plugin');
// css提取
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, './src');
const BUILD_PATH = path.resolve(ROOT_PATH, './build');

module.exports = {
  entry: {
    entry: path.resolve(APP_PATH, './index.jsx'),
    vendor: ['react', 'react-dom']
  },
  output: {
    filename: '[name].js',
    path: BUILD_PATH,
    chunkFilename: '[name].js',
    //publicPath: 'http://dev.hubble.netease.com/'
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015', 'react', 'stage-0'],
              plugins: ['syntax-dynamic-import', ['import', { libraryName: 'antd-mpbile', style: 'css' }]]
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
            'less-loader'
          ]
        }),
        exclude: /node_modules|global/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader'
          ]
        }),
        include: /node_modules|global/
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif|bmp)/i,
        use: [
          'url-loader?limit=1000&name=img/[name].[sha512:hash:base64:8].[ext]'
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot)($|\?)/i,
        use: [
          'url-loader?limit=5000&name=fonts/[name].[sha512:hash:base64:8].[ext]'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.less', '.css', '.png', '.jpg', '.svg', '.gif', '.eot'],
    alias: {
      ImagesPath: path.resolve(ROOT_PATH, '../src/')
    }
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['commons', 'vendor'],
      minChunks: 2
    }),
    new ExtractTextPlugin('commons.css', {
      allChunks: true
    }),
    new HtmlwebpackPlugin({
      template: path.resolve(ROOT_PATH, './src/index.html'),
      filename: path.resolve(ROOT_PATH, './build/index.html'),
      chunks: ['entry', 'vendor'],
      hash: false
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }),
    // 定义为生产环境，编译 React 时压缩到最小
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    //   }
    // }),
    // 可在业务 js 代码中使用 __DEV__ 判断是否是dev模式（dev模式下可以提示错误、测试报告等, production模式不提示）
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse((process.env.NODE_ENV === 'dev') || 'false'))
    }),
    // 加署名
    new webpack.BannerPlugin('Copyright by hubble.netease.cn')
  ]
};


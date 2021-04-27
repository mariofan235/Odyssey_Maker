var path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack')

var HtmlWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, 'index.html'),
  filename: 'index.html',
  inject: 'body'
})


module.exports = {
  entry: {
    app: './src/index.js',
    'production-dependencies': ['phaser']
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js',
    chunkFilename: '[id].[hash:8].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
  },

  plugins: [
    HTMLWebpackPluginConfig,
    new CopyPlugin({
      patterns: [
        {
          from:path.resolve(__dirname, 'index.html'),
          to:path.resolve(__dirname, 'build')
        },
        {
          from:path.resolve(__dirname, 'assets'),
          to:path.resolve(__dirname, 'build/assets')
        }
      ]
    }),
    new webpack.DefinePlugin({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true)
    }),
    new webpack.optimize.SplitChunksPlugin({
      name: 'production-dependencies',
      filename: 'production-dependencies.bundle.js'
    }),
  ]

};

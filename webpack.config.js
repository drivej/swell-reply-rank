const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isDevelopment = true;

module.exports = {
  // entry files
  entry: './src/index.ts',
  target: ['web', 'es6'],
  // bundling mode
  mode: 'development',

  // server
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
    static: {
      directory: path.join(__dirname, './src/assets'),
    },
    compress: true,
    port: 9000,
    hot: false,
  },
  devtool: 'source-map',

  // output bundles (location)
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },

  // file resolutions
  resolve: {
    extensions: ['.ts', '.js'],
  },

  // loaders
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      // new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: true,
      }),
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(), // run TSC on a separate thread
    new HtmlWebpackPlugin({ inject: 'body' }), //
    // new HtmlInlineScriptPlugin(),
  ],
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: ['node_modules'],
  },
};

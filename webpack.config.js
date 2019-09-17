const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: "./src/index.html",
  filename: "index.html",
  inject: "body",
});

module.exports = env => {
  const mode = env.NODE_ENV;
  return {
    mode: mode,
    entry: ["./src/js/main.js", "./src/scss/main.scss"],
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            mode === "production"
              ? MiniCssExtractPlugin.loader
              : "style-loader",
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },

    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
      HtmlWebpackPluginConfig,
    ],
    devServer: {
      host: "0.0.0.0",
      compress: false,
      port: 9000,
      noInfo: false,
      hot: true,
      hotOnly: true,
      inline: true,
      open: true,
      overlay: {
        warnings: true,
        errors: true,
      },
      progress: true,
      useLocalIp: true,
      stats: "minimal",
      clientLogLevel: "silent",
    },
  };
};

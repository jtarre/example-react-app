const path = require("path")
const webpack = require("webpack")
const ManifestPlugin = require("webpack-manifest-plugin")
const UglifyJSPlugin = require("uglifyjs-webpack-plugin")

const IN_PRODUCTION = process.env.NODE_ENV === "production"

const BROWSER_TARGETS = [
  "Explorer >= 11",
  "Edge >= 15",
  "Firefox >= 55",
  "Chrome >= 43",
  "Safari >= 9",
  "iOS >= 9",
  "Opera >= 47",
]

const pack = {
  entry: {
    index: "./src/client/index.js",
    vendor: ["react", "react-dom"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [
            "react",
            [
              "env",
              {
                useBuiltIns: "entry",
                modules: false,
                forceAllTransforms: IN_PRODUCTION,
                targets: {
                  browsers: BROWSER_TARGETS,
                },
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  output: {
    path: path.resolve(__dirname, "./app"),
    filename: IN_PRODUCTION ? `[name].[chunkhash].js` : `[name].js`,
  },
  plugins: [
    new ManifestPlugin({ fileName: `manifest.json` }),
    new webpack.ProvidePlugin({
      // Only need this for bootstrap (https://getbootstrap.com/docs/4.0/getting-started/webpack/)
      $: "jquery/dist/jquery.slim.js",
      jQuery: "jquery/dist/jquery.slim.js",
      "window.jQuery": "jquery/dist/jquery.slim.js",
      Popper: ["popper.js", "default"],
    }),
    new webpack.LoaderOptionsPlugin({
      debug: !IN_PRODUCTION,
      minimize: IN_PRODUCTION,
      options: {
        context: __dirname,
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor", "chunk.manifest"],
      filename: IN_PRODUCTION ? `[name].[chunkhash].js` : `[name].js`,
    }),
  ],
  devtool: IN_PRODUCTION ? "source-map" : "eval-source-map",
}

module.exports = IN_PRODUCTION
  ? {
      ...pack,
      plugins: [
        ...pack.plugins,
        new UglifyJSPlugin({
          sourceMap: true,
          parallel: true,
        }),
        new webpack.EnvironmentPlugin({ NODE_ENV: "production" }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({ minimize: true }),
      ],
    }
  : {
      ...pack,
      performance: { hints: false },
      plugins: [...pack.plugins],
      devServer: {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentBase: path.join(__dirname, "app"),
        compress: true,
        port: 8000,
      },
    }

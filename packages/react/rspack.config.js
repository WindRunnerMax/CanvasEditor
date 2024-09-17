const path = require("path");
const { default: HtmlPlugin } = require("@rspack/plugin-html");
const CopyPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

/**
 * @type {import("@rspack/cli").Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    index: "./src/index.tsx",
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "blob-stream": "blobStream",
    "pdfkit": "PDFDocument",
  },
  plugins: [
    new CopyPlugin([{ from: "./public", to: "." }]),
    new HtmlPlugin({
      filename: "index.html",
      template: "./public/index.html",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "sketching-core": path.resolve(__dirname, "../core/src"),
      "sketching-delta": path.resolve(__dirname, "../delta/src"),
      "sketching-plugin": path.resolve(__dirname, "../plugin/src"),
      "sketching-utils": path.resolve(__dirname, "../utils/src"),
    },
  },
  builtins: {
    define: {
      "__DEV__": JSON.stringify(isDev),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.PUBLIC_URL": JSON.stringify("."),
    },
    pluginImport: [
      {
        libraryName: "@arco-design/web-react",
        customName: "@arco-design/web-react/es/{{ member }}",
        style: true,
      },
      {
        libraryName: "@arco-design/web-react/icon",
        customName: "@arco-design/web-react/icon/react-icon/{{ member }}",
        style: false,
      },
    ],
  },
  module: {
    // https://www.rspack.dev/zh/config/module#rule
    rules: [
      { test: /\.svg$/, type: "asset" },
      {
        test: /.scss$/,
        oneOf: [
          {
            resource: /(module|m)\.scss$/,
            use: "sass-loader",
            type: "css/module",
          },
          {
            use: "sass-loader",
            type: "css",
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                importLoaders: true,
                localIdentName: "[name]__[hash:base64:5]",
              },
            },
          },
        ],
        type: "css",
      },
      {
        // 对`doc-editor-light`的`TreeShaking`有点问题
        test: /doc-editor-light\/dist\/tslib.*\.js/,
        sideEffects: true,
      },
    ],
  },
  target: isDev ? undefined : "es5",
  devtool: isDev ? "source-map" : false,
  output: {
    clean: true,
    chunkLoading: "jsonp",
    chunkFormat: "array-push",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, "build"),
    filename: isDev ? "[name].bundle.js" : "[name].[contenthash].js",
    chunkFilename: isDev ? "[name].chunk.js" : "[name].[contenthash].js",
    assetModuleFilename: isDev ? "[name].[ext]" : "[name].[contenthash].[ext]",
  },
};

// https://www.rspack.dev/

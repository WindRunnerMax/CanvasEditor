const path = require("path");
const { default: HtmlPlugin } = require("@rspack/plugin-html");
const CopyPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    index: "./example/index.tsx",
  },
  plugins: [
    new CopyPlugin([{ from: "./example/public", to: "." }]),
    new HtmlPlugin({
      filename: "index.html",
      template: "./example/public/index.html",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "sketching-core": path.resolve(__dirname, "../core/src"),
      "sketching-delta": path.resolve(__dirname, "../delta/src"),
      "sketching-utils": path.resolve(__dirname, "../utils/src"),
    },
  },
  builtins: {
    define: {
      "__DEV__": JSON.stringify(isDev),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    pluginImport: [
      {
        libraryName: "@arco-design/web-react",
        customName: "@arco-design/web-react/es/{{ member }}",
        style: true,
      },
    ],
  },
  module: {
    rules: [
      { test: /\.svg$/, type: "asset" },
      {
        test: /\.(m|module).scss$/,
        use: [{ loader: "sass-loader" }],
        type: "css/module",
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
    ],
  },
  target: "es5",
  devtool: isDev ? "source-map" : false,
  output: {
    publicPath: "/",
    chunkLoading: "jsonp",
    chunkFormat: "array-push",
    filename: isDev ? "[name].js" : "[name].[hash].js",
    path: path.resolve(__dirname, "build/static"),
  },
};

// https://www.rspack.dev/

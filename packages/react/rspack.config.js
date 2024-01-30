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
    index: "./src/index.tsx",
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
    rules: [
      { test: /\.svg$/, type: "asset" },
      {
        test: /^(?!.*\.module\.scss$)(?!.*\.m\.scss$).*\.scss$/,
        use: [{ loader: "sass-loader" }],
        type: "css",
      },
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
    path: path.resolve(__dirname, "build"),
  },
};

// https://www.rspack.dev/

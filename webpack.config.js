// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;

function generateEntries(folderPath) {
  const entries = {};
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const fileName = path.parse(file).name;
    entries[fileName] = path.resolve(folderPath, file);
  });
  return entries;
}

const config = {
  context: path.resolve(__dirname),
  entry: { ...generateEntries("./src/ts"), ...generateEntries("./src/scss") },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "src/assets"),
  },
  plugins: [
    new MiniCssExtractPlugin(),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          {
            loader: "css-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};

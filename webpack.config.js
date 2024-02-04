const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    ...defaultConfig.entry,
    index: "./src/index.ts",
    editor: "./src/editor.ts",
  },
};

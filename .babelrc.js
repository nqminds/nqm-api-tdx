module.exports = {
  presets: [["@babel/preset-env", {
    // deals with function* generator(), which we don't use
    exclude: ["@babel/plugin-transform-regenerator"],
  }]],
  // support const x = require(""), not require("").default without Webpack
  plugins: ["babel-plugin-add-module-exports"],
};

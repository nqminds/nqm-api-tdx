/* global __dirname, require, module*/
"use strict";

const path = require("path");
const env = require("yargs").argv.env; // use --env with webpack 2

const libraryName = "nqm-api-tdx";

let mode;
let outputFile;

if (env === "build") {
  mode = "production"; // enable minimization using Terser
  outputFile = libraryName + ".min.js";
} else {
  mode = "development"; // disable minimization
  outputFile = libraryName + ".js";
}

const config = {
  mode,
  entry: __dirname + "/src/api-tdx.js",
  devtool: "source-map",
  output: {
    path: __dirname + "/lib",
    filename: outputFile,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve("./src")],
    extensions: [".json", ".js"]
  },
  externals: {
    "base-64": "base-64",
    bluebird: "bluebird",
    "cross-fetch": "cross-fetch",
    debug: "debug",
    "@nqminds/nqm-core-utils": "@nqminds/nqm-core-utils",
    lodash: { 
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "_",
      root: "_",
    },
  },
};

module.exports = config;

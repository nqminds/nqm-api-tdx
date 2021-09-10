import pkg from "./package.json";

const externals = [...Object.keys(pkg.dependencies)];

export default [
  // ES module (for bundlers) build.
  {
    input: "src/api-tdx.js",
    external: externals,
    output: [{file: pkg.module, format: "es", exports: "named", sourcemap: true}],
    plugins: [],
  },

  // CommonJS (for Node)
  {
    input: "src/api-tdx.js",
    external: externals,
    output: [{file: pkg.main, format: "cjs", exports: "named", sourcemap: true}],
    plugins: [],
  },
];

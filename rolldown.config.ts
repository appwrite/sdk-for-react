import { defineConfig } from "rolldown";
import dts from "unplugin-dts/rolldown";
 
export default defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "dist/esm/index.js",
      format: "esm",
    },
    {
      file: "dist/cjs/index.cjs",
      format: "cjs",
    },
  ],
  resolve: {
    tsconfigFilename: "tsconfig.json",
  },
  platform: "browser",
  external: ["react", "react-dom", "react/jsx-runtime"],
  plugins: [dts({ outDirs: ["dist/esm", "dist/cjs"] })],
});

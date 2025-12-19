import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  tsconfig: "tsconfig.json",
  platform: "browser",
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
  ],
});

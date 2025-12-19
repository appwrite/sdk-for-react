import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
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
  tsconfig: "tsconfig.json",
  platform: "browser",
  external: ["react", "react-dom", "react/jsx-runtime"],
});

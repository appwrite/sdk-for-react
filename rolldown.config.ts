import { defineConfig } from "rolldown";
import dts from "unplugin-dts/rolldown";

const entries = {
  index: "./src/index.ts",
  "server/index": "./src/server/index.ts",
  "server/next": "./src/server/next.ts",
  "server/web": "./src/server/web.ts",
  "server/node": "./src/server/node.ts",
  "handlers/index": "./src/handlers/index.ts",
  "handlers/next": "./src/handlers/next.ts",
  "handlers/web": "./src/handlers/web.ts",
  "handlers/node": "./src/handlers/node.ts",
};

export default defineConfig([
  {
    input: entries,
    output: { dir: "dist/esm", format: "esm", entryFileNames: "[name].js" },
    resolve: { tsconfigFilename: "tsconfig.json" },
    platform: "neutral",
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "appwrite",
      "node-appwrite",
      "server-only",
      "@tanstack/react-query",
      "next/headers",
      "node:http",
    ],
    plugins: [dts({ outDirs: ["dist/esm"] })],
  },
  {
    input: entries,
    output: { dir: "dist/cjs", format: "cjs", entryFileNames: "[name].cjs" },
    resolve: { tsconfigFilename: "tsconfig.json" },
    platform: "neutral",
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "appwrite",
      "node-appwrite",
      "server-only",
      "@tanstack/react-query",
      "next/headers",
      "node:http",
    ],
    plugins: [dts({ outDirs: ["dist/cjs"] })],
  },
]);

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

const preStatePath = new URL("../.changeset/pre.json", import.meta.url);
const preState = existsSync(preStatePath)
  ? JSON.parse(readFileSync(preStatePath, "utf8"))
  : null;
const isPreMode = preState?.mode === "pre";
const tag = packageJson.version.includes("-") ? "next" : "latest";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("bun", ["run", "build"]);
run(
  "bun",
  isPreMode
    ? ["run", "changeset", "publish"]
    : ["run", "changeset", "publish", "--tag", tag]
);

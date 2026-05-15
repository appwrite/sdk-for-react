import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

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
run("bun", ["run", "changeset", "publish", "--tag", tag]);

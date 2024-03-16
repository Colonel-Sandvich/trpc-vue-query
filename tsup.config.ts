import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*.ts"],
  format: ["esm"],
  skipNodeModulesBundle: true,
  dts: true,
});

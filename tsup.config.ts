import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  skipNodeModulesBundle: true,
  dts: true,
  clean: true,
  splitting: false,
});

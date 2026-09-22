import * as esbuild from "esbuild";
const context = await esbuild.context({
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "script.js",
  format: "iife",
  target: "es2020",
  sourcemap: false,
});
await context.watch();
if (!process.argv.includes("--watch-only")) {
  await context.serve({ servedir: ".", host: "127.0.0.1", port: 8000 });
  console.log("Flores amarillas: http://localhost:8000");
}

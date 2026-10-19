import * as esbuild from "esbuild";
const experienceContext = await esbuild.context({
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "script.js",
  format: "iife",
  target: "es2020",
  sourcemap: false,
});
const pagesContext = await esbuild.context({
  entryPoints: [
    "src/menu.js",
    "src/experiences/experience.js",
    "src/experiences/flores-amarillas.js",
    "src/experiences/navidad.js",
  ],
  bundle: true,
  outdir: ".",
  outbase: "src",
  format: "iife",
  target: "es2020",
});
await Promise.all([experienceContext.watch(), pagesContext.watch()]);
if (!process.argv.includes("--watch-only")) {
  await experienceContext.serve({ servedir: ".", host: "127.0.0.1", port: 8000 });
  console.log("Vista previa: http://localhost:8000");
}

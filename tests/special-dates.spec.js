const { test, expect } = require("@playwright/test");

test("fechas anuales usan Bogotá y se bloquean al día siguiente", async () => {
  const esbuild = require("esbuild");
  const result = await esbuild.build({
    entryPoints: ["src/special-dates.js"],
    bundle: true,
    format: "cjs",
    write: false,
  });
  const module = { exports: {} };
  new Function("module", "exports", result.outputFiles[0].text)(module, module.exports);
  const { celebrations, getDateStatus, TIME_ZONE } = module.exports;
  const dates = Object.fromEntries(celebrations.map((item) => [item.id, item]));
  expect(TIME_ZONE).toBe("America/Bogota");
  const october = new Date("2026-10-19T12:00:00-05:00");
  expect(getDateStatus(dates["flores-amarillas"], october).unlocked).toBe(false);
  expect(getDateStatus(dates.cumpleanos, october).unlocked).toBe(false);
  expect(getDateStatus(dates.navidad, october).unlocked).toBe(false);
  expect(getDateStatus(dates["san-valentin"], october).unlocked).toBe(false);
  expect(getDateStatus(dates.navidad, new Date("2026-12-25T04:59:59Z")).unlocked).toBe(false);
  expect(getDateStatus(dates.navidad, new Date("2026-12-25T05:00:00Z")).unlocked).toBe(true);
  expect(getDateStatus(dates.navidad, new Date("2026-12-26T05:00:00Z")).unlocked).toBe(false);
  expect(getDateStatus(dates.navidad, new Date("2027-01-10T12:00:00Z")).unlocked).toBe(false);
  expect(getDateStatus(dates.navidad, new Date("2027-12-25T12:00:00-05:00")).unlocked).toBe(true);
  expect(getDateStatus(dates["flores-amarillas"], new Date("2026-09-21T12:00:00-05:00")).unlocked).toBe(true);
  expect(getDateStatus(dates["flores-amarillas"], new Date("2026-09-22T12:00:00-05:00")).unlocked).toBe(false);
});

test("la página raíz ofrece el menú y bloquea las celebraciones futuras", async ({ page }) => {
  const path = require("node:path");
  const url = require("node:url").pathToFileURL(path.resolve("index.html")).href;
  await page.clock.install({ time: new Date("2026-10-19T12:00:00-05:00") });
  await page.goto(url);
  await expect(page.locator("#celebration-list .memory-card")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Hay días que merecen quedarse." })).toBeVisible();
  await expect(page.getByText("Navidad", { exact: true })).toBeVisible();
  await expect(page.getByText("Esperando su momento").first()).toBeVisible();
});

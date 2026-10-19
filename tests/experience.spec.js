const { test, expect } = require("@playwright/test");
const path = require("node:path");
const url = require("node:url").pathToFileURL(path.resolve("flores-amarillas.html")).href;
test("dedicatoria especial en partículas y cierre personalizado", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  // Acelera solo el reloj de la experiencia, conservando los frames reales de WebGL.
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window);
    let time = performance.now();
    window.requestAnimationFrame = (callback) =>
      raf(() => callback((time += 240)));
  });
  await page.goto(url);
  await page.locator("#name").fill("Zoraya");
  await page.locator("#name").press("Enter");
  await expect(page.locator("#experience")).toBeVisible();
  await page.locator("#last").click();
  await expect(page.locator("#message")).toHaveText(
    "Siempre, siempre estaré para ti.",
  );
  await expect(page.locator("#message")).toContainText(
    "te amé, te amo y te amaré",
    { timeout: 15000 },
  );
  await expect(page.locator("#message")).toHaveText("Mi pinguinita.", {
    timeout: 30000,
  });
  await expect(page.locator("#message")).toHaveText(
    "Hasta más allá del Fin ZORAYA",
    { timeout: 15000 },
  );
  await page.locator("#pause").click();
  await page.screenshot({ path: "test-results/dedication-mobile.png" });
  await expect(page.locator("#pause")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#pause").click();
  await expect(page.locator("#veil")).toHaveCSS("opacity", "0", {
    timeout: 15000,
  });
  await page.locator("#back").click();
  await expect(page.locator("#intro")).toBeVisible();
  expect(errors).toEqual([]);
});
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
});
test("entrada local, Zoraya, pausa, sonido y vuelta al inicio", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  await expect(page.locator("#intro")).toBeVisible();
  await expect(page.locator("#experience")).toBeHidden();
  await page.screenshot({ path: "test-results/intro.png" });
  await page.locator("#name").fill("  zOrAyA  ");
  await expect(page.locator("#recognition")).toContainText("reconocer");
  await page.locator("#name").press("Enter");
  await expect(page.locator("#experience")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#title")).toHaveText("Para ti, Zoraya.");
  await page.waitForTimeout(13000);
  await page.screenshot({ path: "test-results/galaxy.png" });
  await page.locator("#pause").click();
  await expect(page.locator("#pause")).toHaveAttribute("aria-pressed", "true");
  const message = await page.locator("#message").textContent();
  await page.waitForTimeout(1600);
  await expect(page.locator("#message")).toHaveText(message);
  await page.locator("#pause").click();
  const musicBefore = await page.locator("#sound").getAttribute("aria-pressed");
  await page.locator("#sound").click();
  await expect(page.locator("#sound")).toHaveAttribute(
    "aria-pressed",
    musicBefore === "true" ? "false" : "true",
  );
  await page.locator("#back").click();
  await expect(page.locator("#intro")).toBeVisible();
  expect(errors).toEqual([]);
});
test("amistad móvil, nombre seguro y final completo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.locator("#name").fill("María Paz");
  await page.locator("#name").press("Enter");
  await expect(page.locator("#experience")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#title")).toHaveText(
    "Un cielo para ti, María Paz.",
  );
  await page.waitForTimeout(9000);
  await page.screenshot({ path: "test-results/mobile.png" });
  await page.locator("#last").click();
  await page.waitForTimeout(8000);
  await page.screenshot({ path: "test-results/constellation.png" });
  await expect(page.locator("#message")).toContainText("María Paz");
  await page.waitForTimeout(47000);
  await expect(page.locator("#veil")).toHaveCSS("opacity", "1");
  await page.locator("#back").click();
  await page.locator("#name").fill("<img src=x>");
  await page.locator("#name").press("Enter");
  await expect(page.locator("#experience")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#title")).toContainText("<img src=x>");
  await expect(page.locator("#title img")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("bancos independientes, categorías y no repetición", async () => {
  const esbuild = require("esbuild");
  const result = await esbuild.build({
    entryPoints: ["src/messages.js"],
    bundle: true,
    format: "cjs",
    write: false,
  });
  const module = { exports: {} };
  new Function("module", "exports", result.outputFiles[0].text)(
    module,
    module.exports,
  );
  const { zorayaMessages, friendshipMessages, pinguinitaMessages, MessageBag } =
    module.exports;
  for (const bank of [zorayaMessages, friendshipMessages]) {
    expect(bank.length).toBeGreaterThanOrEqual(100);
    expect(new Set(bank.map((m) => m.text)).size).toBe(bank.length);
    const bag = new MessageBag(bank);
    const seen = new Set();
    for (let i = 0; i < bank.length; i++) seen.add(bag.next().text);
    expect(seen.size).toBe(bank.length);
  }
  expect(new Set(zorayaMessages.map((m) => m.category)).size).toBe(13);
  expect(new Set(friendshipMessages.map((m) => m.category)).size).toBe(8);
  expect(pinguinitaMessages.length).toBeGreaterThanOrEqual(30);
  expect(new Set(pinguinitaMessages.map((m) => m.text)).size).toBe(
    pinguinitaMessages.length,
  );
});

test("todos los nombres especiales abren el mismo universo íntimo", async () => {
  const esbuild = require("esbuild");
  const result = await esbuild.build({
    entryPoints: ["src/config.js"],
    bundle: true,
    format: "cjs",
    write: false,
  });
  const module = { exports: {} };
  new Function("module", "exports", result.outputFiles[0].text)(
    module,
    module.exports,
  );
  const { isSpecialName } = module.exports;
  for (const alias of [
    "zoraya",
    "ZORAYA ESTEFANIA SAILEMA PALATE",
    "Pinguinita",
    "Bubucita",
    "Mumilona",
    "Enojona",
    "Cachetonsita",
    "Cacetonsita",
    "Comelona",
  ])
    expect(isSpecialName(alias)).toBe(true);
  expect(isSpecialName("María Paz")).toBe(false);
});

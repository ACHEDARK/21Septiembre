const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests",
  timeout: 90000,
  workers: 1,
  use: {
    headless: true,
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
});

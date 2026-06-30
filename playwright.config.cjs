const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    actionTimeout: 8000,
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "node tools/static-server.cjs --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 10000
  },
  reporter: "line"
});


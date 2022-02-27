/**
 * Karma test configurations.
 */

process.env.CHROME_BIN = require("puppeteer").executablePath();
module.exports = function (config) {
  config.set({
    basePath: "dist-test",
    frameworks: ["jasmine"],
    files: [{ pattern: "**/*.test.js", type: "js" }],
    exclude: [],
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ["ChromeHeadless"],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
  });
};

/**
 * Script to check if a specific package version has been published to npm already.
 */
import { request } from "https";
import fs from "fs";
const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

const packageName = packageJson.name;
const packageVersion = packageJson.version;

const href = `https://registry.npmjs.org/${packageName}/${packageVersion}`;
console.log(`Calling ${href}`);

const req = request(
  {
    host: "registry.npmjs.org",
    port: 443,
    path: `${packageName}/${packageVersion}`,
    method: "GET",
  },
  (result) => {
    console.log("Status Code: ", result.statusCode);
    if (result.statusCode === 400) {
      console.log("Version does not exist.");
      process.exit(0);
    }
    throw new Error(
      `Version ${packageVersion} already exists in the NPM registry. Please increase the version in package.json.`
    );
  }
);
req.on("error", (error) => {
  console.error("Error:", error);
  throw new Error(`Request Error: ${error}`);
});
req.end();

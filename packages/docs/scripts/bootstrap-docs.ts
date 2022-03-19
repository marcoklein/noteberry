/**
 * Runs the `build:docs` command in all packages and copies the resulting `dist-docs`
 * content into the `dist` folder.
 */
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import child_process from "child_process";
import { promisify } from "util";

const exec = promisify(child_process.exec);
const startTime = Date.now();

const DIST_FOLDER_NAME = "dist";
const DIST_DOCS_FOLDER_NAME = "dist-docs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRootPath = path.join(__dirname, "..");
const packageName = path.basename(packageRootPath);
const packagesPath = path.join(packageRootPath, "..");
const distPath = path.join(packageRootPath, DIST_FOLDER_NAME);

console.log(`Cleaning ${DIST_FOLDER_NAME}.`);
await fs.remove(distPath);

console.log("Ensure target directories.");
await fs.ensureDir(distPath);

console.log("Calling build:docs for all packages.");
const result = await exec("yarn lerna run build:docs");
console.log(result.stdout);

console.log(`Collecting ${DIST_DOCS_FOLDER_NAME} folders from all packages.`);
const packageDirs = await fs.readdir(path.join(packagesPath));
await Promise.all(
  packageDirs
    .filter((dir) => dir !== packageName)
    .map((dir) => [dir, path.join(packagesPath, dir, DIST_DOCS_FOLDER_NAME)])
    .filter(([_, packageDistDocsPath]) => fs.existsSync(packageDistDocsPath))
    .map(([dir, packageDistDocsPath]) => {
      console.log(
        `Copy from ${packageDistDocsPath} into local dist/${dir} folder.`
      );
      return fs.copy(packageDistDocsPath, path.join(distPath, dir));
    })
);

console.log(
  `Done bootstrapping of package ${DIST_DOCS_FOLDER_NAME} in ${
    Date.now() - startTime
  } milliseconds.`
);

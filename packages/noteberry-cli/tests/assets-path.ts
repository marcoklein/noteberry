import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Path to assets folder.
 */
export const ASSETS_PATH = path.join(__dirname, "assets");

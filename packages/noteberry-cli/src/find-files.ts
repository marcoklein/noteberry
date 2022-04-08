import globImport from "glob";
import { promisify } from "util";

const glob = promisify(globImport);

export async function findMarkdownFiles(directory: string) {
  return glob("**/*.md", { cwd: directory });
}

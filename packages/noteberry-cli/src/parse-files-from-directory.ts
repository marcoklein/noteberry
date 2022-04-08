import { findMarkdownFiles } from "./find-files.js";
import { linkPages, PageModel } from "noteberry-parser";
import fs from "fs-extra";
import path from "node:path";

export async function parseFilesFromDirectory(directory: string) {
  const files = await findMarkdownFiles(directory);
  const parsedPages = await Promise.all(
    files.map(async (filePath): Promise<PageModel> => {
      const content = (
        await fs.readFile(path.join(directory, filePath))
      ).toString("utf8");
      const basename = path.basename(filePath);
      const withoutExt = basename.slice(
        0,
        basename.length - path.extname(basename).length
      );
      return {
        title: withoutExt,
        content,
      };
    })
  );
  return linkPages(parsedPages);
}

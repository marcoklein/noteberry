import { unified } from "unified";
import MDAST from "mdast";
import UNIST from "unist";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { visit } from "unist-util-visit";
import fs from "node:fs/promises";
import path from "path";

interface FileSystemDocument {
  path: string;
  content: string;
}

/**
 * Reads all markdown files of a directory.
 *
 * @param directoryPath Directory to read.
 * @returns Path and content of markdown files within the directory.
 */
async function readMarkdownFiles(
  directoryPath: string
): Promise<FileSystemDocument[]> {
  // read files in folder
  const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
  // filter files from folder
  const files = dirents
    // only consider files that have a markdown extension
    .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === ".md")
    // return path of file
    .map((dirent) => path.join(directoryPath, dirent.name));
  // read file contents
  const filesWithContentPromises = files.map(
    async (filePath): Promise<FileSystemDocument> => ({
      path: filePath,
      // read content of file
      content: (await fs.readFile(filePath)).toString("utf-8"),
    })
  );
  // resolve asynchronous file loading
  return Promise.all(filesWithContentPromises);
}

// call function with our test repository
const files = await readMarkdownFiles("./test/resources");
// prints results
files.forEach(({ path }) => console.log(`Read file path: ${path}`));

interface WikiLinkNode extends UNIST.Node {
  type: "wikiLink";
  value: string;
  data: {
    alias: string;
    permalink: string;
  };
}

type SyntaxTree = MDAST.Root | WikiLinkNode;

function parseDocumentLinks(parsedDocumentContent: SyntaxTree) {
  const documentLinks: string[] = [];
  visit(parsedDocumentContent, "wikiLink", (wikiLinkNode) => {
    const value = wikiLinkNode.value;
    const alias = wikiLinkNode.data.alias;
    // if a link contains a ":" the remark-wiki-link plugin would parse it as an alias
    // as we are not using the alias feature we re-construct the full link content
    // LIMITATION: this approach does not recognize links that have the same name and alias
    // e.g. name:name - keep that in mind when using this snippet
    const linkName = `${wikiLinkNode.value}${
      value !== alias ? ":" + alias : ""
    }`;
    documentLinks.push(linkName);
  });
  return documentLinks;
}

function buildDocumentsLinkMap(files: FileSystemDocument[]) {
  const documentParser = unified().use(remarkParse).use(remarkWikiLink);
  const documentLinksMap: { [key: string]: string[] } = {};
  files.forEach(({ path, content }) => {
    const parsedDocumentContent = documentParser.parse(content);
    documentLinksMap[path] = parseDocumentLinks(parsedDocumentContent);
  });
  return documentLinksMap;
}

console.log("Documents links map: ", buildDocumentsLinkMap(files));

function buildDocumentsTitleMap(files: FileSystemDocument[]) {
  const documentTitleMap: { [key: string]: string } = {};
  files.forEach(({ path }) => {
    // extract document title
    const title = /([^\/]+)\.md$/.exec(path)?.[1];
    // verify a consistent mapping
    if (!title) throw new Error(`Could not extract title from path: ${path}`);
    if (documentTitleMap[title] !== undefined)
      throw new Error(
        `Title "${title}" already exists for path "${documentTitleMap[title]}".`
      );
    documentTitleMap[title] = path;
  });
  return documentTitleMap;
}

console.log("Documents title map: ", buildDocumentsTitleMap(files));

function buildMasterMappings(
  documentTitleToPathMap: { [title: string]: string },
  documentPathToLinksMap: { [path: string]: string[] }
) {
  // create interim mapping tables to easily map entries
  const documentPathToTitleMap: { [path: string]: string } = {};
  Object.entries(documentTitleToPathMap).forEach(
    ([title, path]) => (documentPathToTitleMap[path] = title)
  );
  const documentTitleToLinksMap: { [title: string]: string[] } = {};
  Object.entries(documentPathToLinksMap).forEach(
    ([path, links]) =>
      // map document title to links
      (documentTitleToLinksMap[documentPathToTitleMap[path]] = links)
  );
  // return all mappings
  return {
    documentTitleToPathMap,
    documentPathToLinksMap,
    documentPathToTitleMap,
    documentTitleToLinksMap,
  };
}

console.log(
  "Master mappings: ",
  buildMasterMappings(
    buildDocumentsTitleMap(files),
    buildDocumentsLinkMap(files)
  )
);

// we build a global master mapping table
// so we can reuse it later
const globalMasterMapping = buildMasterMappings(
  buildDocumentsTitleMap(files),
  buildDocumentsLinkMap(files)
);

function findDocumentPathOfLink(
  masterMapping: ReturnType<typeof buildMasterMappings>,
  linkName: string
) {
  const linkPath = masterMapping.documentTitleToPathMap[linkName];
  return {
    // return true, if the path exists
    // if false, there is no document for the link name
    existing: linkPath !== undefined,
    path: linkPath,
  };
}

console.log(
  "Path for link Home: ",
  findDocumentPathOfLink(globalMasterMapping, "Home")
);
console.log(
  "Path for link Farm: ",
  findDocumentPathOfLink(globalMasterMapping, "Farm")
);
console.log(
  "Path for link Farm: ",
  findDocumentPathOfLink(globalMasterMapping, "Cow")
);

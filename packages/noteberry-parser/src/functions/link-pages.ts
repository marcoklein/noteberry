import { ParsedBlockNode, parsePageContent } from "./parse-page-content.js";

export interface PageModel {
  title: string;
  content: string;
}

export interface ParsedPage extends PageModel {
  parsedBlocks: ParsedBlockNode[];
  links: string[];
}

export function linkPages(pages: PageModel[]) {
  const parsedPages = parsePages(pages);
  const pagesByTitle = createPagesByTitleMap(parsedPages);
  return { parsedPages, pagesByTitle };
}

function createPagesByTitleMap(parsedPages: ParsedPage[]) {
  const pagesByTitle = new Map<string, ParsedPage>();
  for (const page of parsedPages) {
    pagesByTitle.set(page.title, page);
    page.links = collectLinks(page.parsedBlocks);
  }
  return pagesByTitle;
}

function parsePages(pages: PageModel[]) {
  return pages.map(({ title, content }): ParsedPage => {
    const parsedBlocks = parsePageContent(content);
    const links = collectLinks(parsedBlocks);
    return {
      title,
      content,
      parsedBlocks,
      links,
    };
  });
}

function collectLinks(parsedBlocks: ParsedBlockNode[]) {
  const links: string[] = [];
  for (const parsedBlock of parsedBlocks) {
    links.push(...parsedBlock.linkNodes.map(({ value }) => value));
  }
  return links;
}

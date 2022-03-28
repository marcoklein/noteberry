import { parseBlocks, Block } from "block-based-note-parser";
import { visit } from "unist-util-visit";
import { parseMarkdown, SyntaxTree, WikiLinkNode } from "./parse-markdown.js";

/**
 * Holds the syntax tree of the parsed block
 * and the syntax tree of the block content.
 */
export interface ParsedBlockNode {
  /**
   * Syntax tree for block.
   */
  blockSyntaxTree: Block;
  /**
   * Syntax tree of block content, excluding any indentation.
   */
  contentSyntaxTree: SyntaxTree;
  /**
   * Links that point to other documents.
   */
  linkNodes: WikiLinkNode[];
}

/**
 * Parses content of a complete page.
 *
 * @param pageContent
 */
export function parsePageContent(pageContent: string) {
  const blocks = parseBlocks(pageContent);
  const parsedBlocks: ParsedBlockNode[] = [];
  // TODO change to visit util
  for (const block of blocks.children) {
    if (block.type === "block") {
      const blockContent = block.children
        .map((line) => line.content.value)
        .join("\n");
      const parseTree = parseMarkdown(blockContent);
      parsedBlocks.push({
        blockSyntaxTree: block,
        contentSyntaxTree: parseTree,
        linkNodes: collectLinks(parseTree),
      });
    }
  }
  return parsedBlocks;
}

function collectLinks(parseTree: SyntaxTree) {
  const links: WikiLinkNode[] = [];
  visit(parseTree, "wikiLink", (link) => {
    links.push(link);
  });
  return links;
}

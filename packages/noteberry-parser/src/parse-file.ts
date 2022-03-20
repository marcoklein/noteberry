import { parseBlocks, Block } from "block-based-note-parser";
import { parseMarkdown } from "./parse-markdown";

export interface ParsedBlockNode {
  blockNode: Block;
}

/**
 * Parses content of a complete page.
 *
 * @param pageContent
 */
export function parsePageContent(pageContent: string) {
  const blocks = parseBlocks(pageContent);
  const parsedBlocks: ParsedBlockNode[] = [];
  for (const block of blocks.children) {
    if (block.type === "block") {
      const blockContent = block.children
        .map((line) => line.content)
        .join("\n");
      const parseTree = parseMarkdown(blockContent);
    }
  }
}

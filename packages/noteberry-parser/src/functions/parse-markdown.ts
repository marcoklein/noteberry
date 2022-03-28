import MDAST from "mdast";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import UNIST from "unist";
import { visit } from "unist-util-visit";

export interface WikiLinkNode extends UNIST.Node {
  type: "wikiLink";
  /**
   * Name of link.
   */
  value: string;
  data: {
    alias: string;
    permalink: string;
  };
}

export type SyntaxTree = MDAST.Root | WikiLinkNode;

const PARSER = unified()
  .use(remarkParse)
  .use<[], string, SyntaxTree>(remarkWikiLink);

/**
 * Parse markdown content into a concrete syntax tree.
 *
 * @param content Text content to parse.
 */
export function parseMarkdown(content: string): SyntaxTree {
  const syntaxTree = PARSER.parse(content);
  visit(syntaxTree, "wikiLink", (wikiLinkNode) => {
    const value = wikiLinkNode.value;
    const alias = wikiLinkNode.data.alias;
    // if a link contains a ":" the remark-wiki-link plugin would parse it as an alias
    // as we are not using the alias feature we re-construct the full link content
    // LIMITATION: this approach does not recognize links that have the same name and alias
    // e.g. name:name - keep that in mind when using this snippet
    // TODO write custom wiki link plugin
    const linkName = `${wikiLinkNode.value}${
      value !== alias ? ":" + alias : ""
    }`;
    wikiLinkNode.value = linkName;
  });
  return syntaxTree;
}

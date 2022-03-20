import { expect } from "chai";
import { visit } from "unist-util-visit";
import { parseMarkdown } from "../src/parse-markdown.js";

describe("parse markdown", () => {
  it("should extract wikilinks", () => {
    // given
    const content = "Block with [[link]] and [[another link]]";
    // when
    const result = parseMarkdown(content);
    const links: string[] = [];
    visit(result, "wikiLink", (wikilink) => {
      links.push(wikilink.value);
    });
    // then
    expect(links).to.deep.equal(["link", "another link"]);
  });
});

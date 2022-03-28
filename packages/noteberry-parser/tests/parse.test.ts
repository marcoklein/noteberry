import { expect } from "chai";
import { linkPages, PageModel } from "../src/functions/link-pages.js";

const topicPage: PageModel = {
  title: "Topic",
  content: [
    "- Topic",
    "- Linked by several journal entries.",
    "  - Last bullet.",
  ].join("\n"),
};

const pageWithTwoPointsAboutTopic: PageModel = {
  title: "2022-03-19",
  content: [
    "- Some other content",
    "- [[Topic]]",
    "  - Two other points",
    "  - That link to the topic",
  ].join("\n"),
};

describe("link pages", () => {
  it("should link two pages", () => {
    // given
    const pageWithLink = pageWithTwoPointsAboutTopic;
    const linkedPage = topicPage;
    // when
    const { pagesByTitle, parsedPages } = linkPages([pageWithLink, linkedPage]);
    // then
    expect(parsedPages).to.have.lengthOf(2);
    expect(pagesByTitle.size).to.equal(2);
    expect(pagesByTitle.get("2022-03-19")?.links).to.deep.equal(["Topic"]);
  });
});

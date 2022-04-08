import { parseFilesFromDirectory } from "../src/parse-files-from-directory.js";
import { expect } from "chai";
import { ASSETS_PATH } from "./assets-path.js";

describe("parse", () => {
  it("should parse folder", async () => {
    // given
    const path = ASSETS_PATH;
    // when
    const parseTree = await parseFilesFromDirectory(path);
    // then
    expect(parseTree.parsedPages).to.have.lengthOf(2);
    expect(parseTree.parsedPages.map((page) => page.title)).to.have.members([
      "link",
      "topic",
    ]);
    expect(parseTree.pagesByTitle.get("topic")?.links).to.deep.equal(["link"]);
  });
});

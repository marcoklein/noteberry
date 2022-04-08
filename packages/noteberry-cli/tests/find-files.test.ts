import { expect } from "chai";
import { findMarkdownFiles } from "../src/find-files.js";
import { ASSETS_PATH } from "./assets-path.js";

describe("find files", () => {
  it("should find assets", async () => {
    // given
    const dir = ASSETS_PATH;
    // when
    const files = await findMarkdownFiles(dir);
    // then
    expect(files).to.have.members(["link.md", "topic.md"]);
  });
});

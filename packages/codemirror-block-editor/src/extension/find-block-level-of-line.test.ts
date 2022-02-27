import { createTestEditorWithDoc } from "../../tests/test-utils";
import { findBlockLevelOfLineNumberInState } from "./find-block-level-of-line";

describe("Find Block Level of Line", () => {
  it("should return block levels", () => {
    // given
    const view = createTestEditorWithDoc(["- a", "  "].join("\n"));
    // when
    const lineWithBlock = findBlockLevelOfLineNumberInState(view.state.doc, 1);
    const lineWithoutBlock = findBlockLevelOfLineNumberInState(
      view.state.doc,
      2
    );
    // then
    expect(lineWithBlock).toBe(2);
    expect(lineWithoutBlock).toBe(2);
  });
});

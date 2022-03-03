import { createTestEditorWithExtensionsAndDoc } from "../../tests/test-utils.test";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";

function createTestEditorWithDoc(content: string) {
  return createTestEditorWithExtensionsAndDoc(
    [handleChangeWithinBlockLevel],
    content
  );
}

describe("Handle Change within Block Level", () => {
  it("should delete a line if the first character gets deleted", () => {
    // given
    const view = createTestEditorWithDoc(["- a", "- b"].join("\n"));
    // when
    const changes = view.state.changes({ from: 5, to: 6 });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["- ab"]);
  });

  it("should decrease level if spaces get deleted", () => {
    // given
    const view = createTestEditorWithDoc(["- a", "  - b"].join("\n"));
    // when
    const changes = view.state.changes({ from: 4, to: 6 });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["- a", "- b"]);
  });
});

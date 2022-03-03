import { createTestEditorWithDoc } from "./test-utils.test";

describe("Extension", () => {
  describe("Deletions", () => {
    it("should not decrease level if on lowest level", () => {
      // given
      const view = createTestEditorWithDoc(["- a", "- b"].join("\n"));
      // when
      const changes = view.state.changes({ from: 4, to: 6 });
      view.dispatch(view.state.update({ changes }));
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "- b"]);
    });

    xit("should keep block level if decreased", () => {
      // given
      const view = createTestEditorWithDoc(["- a", "  - b", "- c"].join("\n"));
      // when
      const changes = view.state.changes({ from: 10, to: 12 });
      view.dispatch(view.state.update({ changes }));
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "  - b", "- c"]);
    });
  });
});

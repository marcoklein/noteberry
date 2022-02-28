import { createTestEditorWithDoc } from "./test-utils.test";

describe("Extension", () => {
  describe("Inserts", () => {
    it("should add a new block on the same level", () => {
      // given
      const view = createTestEditorWithDoc("- a");
      // when
      const changes = view.state.changes({ from: 3, insert: "\n" });
      view.dispatch(view.state.update({ changes }));
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "- "]);
    });

    it("should move cursor out of block indentation", () => {
      // given
      const view = createTestEditorWithDoc("- a");
      // when
      const changes = view.state.changes({ from: 3, insert: "\n" });
      view.dispatch(view.state.update({ changes }));
      view.dispatch(view.state.update({ selection: { head: 4, anchor: 5 } }));
      // then
      expect(view.state.selection.main.head).toBe(6);
      expect(view.state.selection.main.anchor).toBe(6);
    });

    it("should move cursor out of block indentation on new line", () => {
      // given
      const view = createTestEditorWithDoc("- a");
      // when
      const changes = view.state.changes({ from: 3, insert: "\n" });
      const selection = { head: 4, anchor: 4 };
      view.dispatch(
        view.state.update({ changes }, { selection, sequential: true })
      );
      // then
      expect(view.state.selection.main.head).toBe(6);
      expect(view.state.selection.main.anchor).toBe(6);
    });

    it("should add multiple lines", () => {
      // given
      const view = createTestEditorWithDoc("- a");
      // when
      view.dispatch(
        view.state.update({
          changes: view.state.changes({ from: 3, insert: "\n" }),
        })
      );
      view.dispatch(
        view.state.update({
          changes: view.state.changes({ from: 6, insert: "\n" }),
        })
      );
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "- ", "- "]);
    });

    it("should add multiple lines at once", () => {
      // given
      const view = createTestEditorWithDoc("- a");
      // when
      const changes = view.state.changes({ from: 3, insert: "\n\n" });
      view.dispatch(view.state.update({ changes }));
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "- ", "- "]);
    });
  });

  describe("Deletions", () => {
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

    it("should not decrease level if on lowest level", () => {
      // given
      const view = createTestEditorWithDoc(["- a", "- b"].join("\n"));
      // when
      const changes = view.state.changes({ from: 4, to: 6 });
      view.dispatch(view.state.update({ changes }));
      // then
      expect(view.state.doc.toJSON()).toEqual(["- a", "- b"]);
    });
  });
});

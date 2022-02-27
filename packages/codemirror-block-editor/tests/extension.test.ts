import { EditorState, EditorView } from "@codemirror/basic-setup";
import { createTestEditorWithDoc } from "./test-utils";

describe("Extension", () => {
  it("should auto indent an added line", () => {
    // given
    const view = createTestEditorWithDoc("- a");
    // when
    const changes = view.state.changes({ from: 3, insert: "\n" });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON().join("\n")).toEqual(
      ["- a", "  "].join("\n")
    );
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
    view.dispatch(view.state.update({ changes }, { selection }));
    // then
    expect(view.state.selection.main.head).toBe(6);
    expect(view.state.selection.main.anchor).toBe(6);
  });
});

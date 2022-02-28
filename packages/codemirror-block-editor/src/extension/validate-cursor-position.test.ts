import { createTestEditorWithExtensionsAndDoc } from "../../tests/test-utils.test";
import { validateBlockIndentation } from "./validate-block-indentation";
import { validateCursorPosition } from "./validate-cursor-position";

function createTestEditorWithDoc(content: string) {
  return createTestEditorWithExtensionsAndDoc(
    [validateCursorPosition, validateBlockIndentation],
    content
  );
}

describe("validateCursorPosition", () => {
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
});

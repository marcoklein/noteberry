import { createTestEditorWithExtensionsAndDoc } from "../../tests/test-utils.test";
import { validateBlockIndentation } from "./validate-block-indentation";

function createTestEditorWithDoc(content: string) {
  return createTestEditorWithExtensionsAndDoc(
    [validateBlockIndentation],
    content
  );
}

describe("validateBlockIndentation", () => {
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
    expect(view.state.doc.toJSON()).toEqual(["- a", "  ", "  "]);
  });

  it("should add multiple lines at once", () => {
    // given
    const view = createTestEditorWithDoc("- a");
    // when
    const changes = view.state.changes({ from: 3, insert: "\n\n" });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["- a", "  ", "  "]);
  });
});

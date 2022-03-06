import { createTestEditorWithExtensionsAndDoc } from "../../tests/test-utils.test";
import { addBlockOnNewLine } from "./add-block-on-new-line";
import { blockMarkerFacet } from "./block-marker-facet";

function createTestEditorWithDoc(content: string) {
  return createTestEditorWithExtensionsAndDoc([addBlockOnNewLine], content);
}

describe("Add Block on New Line", () => {
  it("should add a new block on the same level", () => {
    // given
    const view = createTestEditorWithDoc("- a");
    // when
    const changes = view.state.changes({ from: 3, insert: "\n" });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["- a", "- "]);
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

  it("should add a new block with the correct marker", () => {
    // given
    const view = createTestEditorWithExtensionsAndDoc(
      [blockMarkerFacet.of("+ "), addBlockOnNewLine],
      "+ a"
    );
    // when
    const changes = view.state.changes({ from: 3, insert: "\n" });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["+ a", "+ "]);
  });
});

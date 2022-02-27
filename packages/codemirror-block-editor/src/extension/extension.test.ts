import { EditorState, basicSetup, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { blockLevelExtension } from ".";

describe("Extension", () => {
  it("should auto indent an added line", () => {
    // given
    const initialState = EditorState.create({
      doc: ["- a"].join("\n"),
      extensions: [vim(), blockLevelExtension(), basicSetup],
    });
    const view = new EditorView({
      // parent: document.getElementById("editor") ?? undefined,
      state: initialState,
    });
    // when
    const changes = view.state.changes({ from: 3, insert: "\n" });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON().join("\n")).toEqual(
      ["- a", "  "].join("\n")
    );
  });
});

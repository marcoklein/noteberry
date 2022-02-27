import { EditorState, EditorView } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

/**
 * Adds a keymap to increase block level with `Tab` and decrease level with `Tab-Shift`.
 */
export const blockLevelKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: (view) => _dispatchBlockCommand(view, "increase"),
    shift: (view) => _dispatchBlockCommand(view, "decrease"),
  },
]);

function _dispatchBlockCommand(
  view: EditorView,
  mode: "increase" | "decrease"
) {
  const changes: ChangeSpec[] = [];
  const lines = view.state.selection.ranges.map((range) =>
    view.state.doc.lineAt(range.from)
  );
  for (const line of lines) {
    if (mode === "increase") {
      changes.push({ from: line.from, insert: "  " });
    } else if (mode === "decrease") {
      changes.push({ from: line.from, to: line.from + 2 });
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!changes.length) return false;
  view.dispatch({ changes });
  return true;
}

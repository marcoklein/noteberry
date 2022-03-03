import { EditorState, EditorView } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import {
  findBlockLevelAndLineNumberOfLineNumberInDocument,
  findBlockLevelOfLineNumberInDocument,
} from "./find-block-level-of-line";

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
      console.log("increase");
      changes.push({ from: line.from, insert: "  " });
    } else if (mode === "decrease") {
      const { rootBlockLine, blockLevel } =
        findBlockLevelAndLineNumberOfLineNumberInDocument(
          view.state.doc,
          line.number
        );

      if (rootBlockLine && blockLevel - 2 > 0) {
        console.log(
          `decrease rootBlockLine=${rootBlockLine}, blockLevel=${blockLevel}`
        );
        changes.push({ from: line.from, to: line.from + 2 });
      }
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!changes.length) return false;
  view.dispatch({ changes });
  return true;
}

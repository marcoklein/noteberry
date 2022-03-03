import { EditorView } from "@codemirror/basic-setup";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import {
  inputDecreaseBlockLevelEffect,
  inputIncreaseBlockLevelEffect,
} from "./effects";

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
  const effects: StateEffect<unknown>[] = [];
  const lines = view.state.selection.ranges.map((range) =>
    view.state.doc.lineAt(range.from)
  );
  for (const line of lines) {
    if (mode === "increase") {
      effects.push(inputIncreaseBlockLevelEffect.of(line.number));
    } else if (mode === "decrease") {
      effects.push(inputDecreaseBlockLevelEffect.of(line.number));
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!effects.length) return false;
  view.dispatch({ effects });
  return true;
}

import { EditorView } from "@codemirror/basic-setup";

export const dotTheme = EditorView.baseTheme({
  ".cm-dot": {
    height: "10px",
    width: "10px",
    backgroundColor: "#bbb",
    borderRadius: "50%",
    display: "inline-block",
    cursor: "grab",
  },
  ".cm-dot:hover": {
    backgroundColor: "#000",
    height: "10px",
    width: "10px",
  },
});

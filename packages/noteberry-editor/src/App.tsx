import { Editor } from "./Editor";
import { version } from "./version.gen";

export function App() {
  return (
    <>
      <div>
        <h2 style={{ display: "inline" }}>Noteberry Editor</h2>
      </div>

      <div style={{ width: "12rem" }}>
        <Editor></Editor>
      </div>
      <Editor></Editor>

      <hr />

      <div style={{ float: "right" }}>v{version}</div>
    </>
  );
}

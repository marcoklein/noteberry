import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { writeNotificationToHtml } from "./write-notifications";
import { blockLevelListenerFacet, blockEditor } from "../src";
import { writeVersionToHtml } from "./write-version-to-html";

writeVersionToHtml();

const initialState = EditorState.create({
  doc: [
    "- Indent block with Tab",
    "- and use Shift-Tab to decrease the block indentation",
    "- itemA [[test]]",
    "  - itemB",
    "    - itemC",
    "- itemD",
  ].join("\n"),
  extensions: [
    vim(),
    blockEditor(),
    basicSetup,
    blockLevelListenerFacet.of((effect) => {
      writeNotificationToHtml(JSON.stringify(effect));
    }),
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});

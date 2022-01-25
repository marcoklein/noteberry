import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { blockLevelDecorationExtension } from "./block-level-decoration-extension";
import {
  indendationKeymap,
  mapInputBlockEffectsToSetBlockEffects,
} from "./input-commands";
import { writeVersionToHtml } from "./set-version";

writeVersionToHtml();

const initialState = EditorState.create({
  doc: [
    "Indent block with Tab",
    "and use Shift-Tab to decrease the block indentation",
    "itemA",
    "itemB",
    "itemC",
    "itemD",
  ].join("\n"),
  extensions: [
    vim(),
    indendationKeymap,
    mapInputBlockEffectsToSetBlockEffects,
    blockLevelDecorationExtension(),
    basicSetup,
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});

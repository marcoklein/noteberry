import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import {
  HighlightStyle,
  tags,
  TagStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";
import { vim } from "@replit/codemirror-vim";
import { writeNotificationToHtml } from "./write-notifications";
import { blockLevelListenerFacet, blockEditor } from "../src";
import { writeVersionToHtml } from "./write-version-to-html";
import {
  blockDecorationFacet,
  blockRendererViewPlugin,
} from "../src/view/block-renderer-view-plugin";
import { Decoration, DecorationSet, Range, WidgetType } from "@codemirror/view";

writeVersionToHtml();

class DemoWidget extends WidgetType {
  constructor(readonly content: string) {
    super();
  }

  eq(other: DemoWidget) {
    return other.content == this.content;
  }

  toDOM() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<h3 style="display: inline; user-select: all">${this.content}</h3>`;
    wrap.style.display = "inline-block";
    wrap.style.userSelect = "all";

    wrap.classList.add("cm-block-html");

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

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
    blockDecorationFacet.of((text) => {
      // TODO support multiple lines
      // TODO this should support existing language plugins of codemirror!!!
      const line = text.line(1);
      const regex = /\[\[([^\]]*)\]\]/g;
      let result: RegExpExecArray | null;
      const tempDecos: Range<Decoration>[] = [];
      while ((result = regex.exec(line.text)) !== null) {
        let matchIndex = result.index;
        let t = result[0].length;
        tempDecos.push(
          Decoration.mark({
            inclusive: false,
            class: "cm-wikilink",
          }).range(line.from + matchIndex, line.from + matchIndex + t)
        );
      }
      tempDecos.push(
        Decoration.mark({
          inclusive: false,
          attributes: {
            style: "display: inline",
          },
          tagName: "h2",
        }).range(line.from, line.to)
      );
      tempDecos.push(
        Decoration.replace({
          inclusive: true,
          block: false,
          widget: new DemoWidget(line.text),
          inclusiveEnd: true,
          inclusiveStart: true,
        }).range(line.from, line.to)
      );
      return tempDecos;
    }),
    EditorView.baseTheme({
      ".cm-block-html :first-child": {
        "padding-top": "0",
        "margin-top": "0",
      },
    }),
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});

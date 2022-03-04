import { Text, EditorSelection, EditorState, Facet } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  Range,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";

export const setBlockContentViewFacet =
  Facet.define<(blockContent: Text) => void>();

export const blockRendererViewPlugin = ViewPlugin.fromClass(
  class {
    decorations = Decoration.none;
    update(update: ViewUpdate) {
      const tempDecos: Range<Decoration>[] = [];
      for (const { from, to } of update.view.visibleRanges) {
        const fromLine = update.view.state.doc.lineAt(from);
        const toLine = update.view.state.doc.lineAt(to);
        for (
          let lineNumber = fromLine.number;
          lineNumber <= toLine.number;
          lineNumber++
        ) {
          const line = update.view.state.doc.line(lineNumber);
          const blockMarkerIndex = line.text.indexOf("- ");

          // TODO parse block content
          const regex = /\[\[([^\]]*)\]\]/g;
          let result: RegExpExecArray | null;
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
        }
      }
      this.decorations = Decoration.set(tempDecos);
    }
  },
  {
    decorations: (v) => v.decorations,
    eventHandlers: {
      mousedown: (e, view) => {
        let target = e.target as HTMLElement;
        const line = view.state.doc.lineAt(view.posAtDOM(target));
        // console.log(target.nodeName);
        if (target.classList.contains("cm-wikilink")) {
          console.log("pressed wikilink");
        }
      },
      mousemove: (e, view) => {
        let target = e.target as HTMLElement;
        // const line = view.state.doc.lineAt(view.posAtDOM(target));
        // console.log("mouse move on", line);
        // e.preventDefault();
      },
      dragstart: (e, view) => {
        let target = e.target as HTMLElement;
        // const line = view.state.doc.lineAt(view.posAtDOM(target));
        // console.log("mouse drag", line.number);
        // e.preventDefault();
      },
      drag: (e, view) => {
        let target = e.target as HTMLElement;
        // const line = view.state.doc.lineAt(view.posAtDOM(target));
        // console.log(" drag", line.number);
        // e.preventDefault();
      },
      dragenter: (e, view) => {
        let target = e.target as HTMLElement;
        // const line = view.state.doc.lineAt(view.posAtDOM(target));
        // console.log("enter", line.number);
        // e.preventDefault();
      },
    },
  }
);

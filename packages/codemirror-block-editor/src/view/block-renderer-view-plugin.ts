import { Text, EditorSelection, EditorState, Facet } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  Range,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { parseBlocks } from "block-based-note-parser";

/**
 * Data for a block.
 */
export interface BlockModel {
  content: Text;
  mode: "edit" | "view";
}

/**
 * Define decorations for a specific block content.
 * The given `blockContent` excludes any indentation.
 *
 * The function maps from and to positions of the decoration range to the original document.
 * This means, that you must only consider the positions within the provided `blockContent`.
 */
export const blockDecorationFacet =
  Facet.define<(blockContent: Text) => Range<Decoration>[]>();

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

          const blockDecorators = update.state.facet(blockDecorationFacet);
          // currently a block can only have one line of text
          // TODO exclude line marker and indentation from text and add that offset after plugin evaluation
          const blockSyntaxTree = parseBlocks(line.text);
          let indentation = 0;
          let blockContent = "";
          if (blockSyntaxTree.children[0].type === "Block") {
            indentation =
              blockSyntaxTree.children[0].children[0].data.indentation.value;
            blockContent =
              blockSyntaxTree.children[0].children[0].data.content.value;
          }
          const blockText = Text.of([blockContent]);
          if (!blockContent.length) continue;
          blockDecorators.forEach((blockDecorator) => {
            const decorations = blockDecorator(blockText).map((range) => {
              const decoration = range.value;
              // TODO replace range for multiple lines
              return decoration.range(
                range.from + line.from + indentation,
                range.to + line.from + indentation
              );
            });
            tempDecos.push(...decorations);
          });
        }
      }
      this.decorations = Decoration.set(tempDecos, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

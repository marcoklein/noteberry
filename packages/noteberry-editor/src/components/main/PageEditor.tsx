import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  EditorView,
} from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { foldGutter, foldKeymap } from "@codemirror/fold";
import { indentOnInput } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter";
import { defaultKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { defaultHighlightStyle } from "@codemirror/highlight";

// import { commentKeymap } from "@codemirror/comment";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
// import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
// import { rectangularSelection } from "@codemirror/rectangular-selection";
// import { lintKeymap } from "@codemirror/lint";

import { vim } from "@replit/codemirror-vim";

import { blockEditor } from "codemirror-block-editor";
import { useEffect, useRef } from "react";

interface ComponentProps {
  lines: string[];
}

/**
 * Edit content of a page.
 */
export function PageEditor({ lines }: ComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const initialState = EditorState.create({
      doc: lines.join("\n"),
      extensions: [
        vim(),
        blockEditor(),

        // form basic-setup
        // lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        // foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(false),
        indentOnInput(),
        defaultHighlightStyle.fallback,
        bracketMatching(),
        closeBrackets(),
        // autocompletion(),
        // rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          // ...commentKeymap,
          // ...completionKeymap,
          // ...lintKeymap,
        ]),
      ],
    });
    const view = new EditorView({
      parent: containerRef.current,
      state: initialState,
    });

    return () => {
      view.destroy();
    };
  }, [containerRef, lines]);

  return <div ref={containerRef}></div>;
}

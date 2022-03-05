import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";

import { blockEditor } from "codemirror-block-editor";
import { useEffect, useRef } from "react";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
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
        // setBlockLevelListenerFacet.of((effect) => {
        //   writeNotificationToHtml(JSON.stringify(effect));
        // }),
      ],
    });
    const view = new EditorView({
      parent: containerRef.current,
      state: initialState,
    });
    return () => {
      view.destroy();
    };
  }, [containerRef]);

  return <div ref={containerRef}></div>;
}

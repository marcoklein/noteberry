import {
  Decoration,
  Range,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

class DotWidget extends WidgetType {
  constructor(readonly level: number) {
    super();
  }

  eq(other: DotWidget) {
    return other.level == this.level;
  }

  toDOM() {
    const dot = document.createElement("span");
    dot.classList.add("cm-dot");

    const wrap = document.createElement("span");
    wrap.style.paddingRight = `4px`;
    wrap.style.paddingLeft = `${this.level + 1}ch`;
    wrap.appendChild(dot);
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

export const dotWidgetViewPlugin = ViewPlugin.fromClass(
  class {
    decorations = Decoration.none;
    update(update: ViewUpdate) {
      const tempDecos: Range<Decoration>[] = [];
      update.view.visibleRanges.forEach(({ from, to }) => {
        const fromLine = update.state.doc.lineAt(from);
        const toLine = update.state.doc.lineAt(to);
        for (
          let lineNumber = fromLine.number;
          lineNumber <= toLine.number;
          lineNumber++
        ) {
          tempDecos.push(
            Decoration.widget({
              widget: new DotWidget(0),
              block: false,
              side: -1,
            }).range(update.state.doc.line(lineNumber).from)
          );
        }
      });
      this.decorations = Decoration.set(tempDecos);
    }
  },
  {
    decorations: (v) => v.decorations,
    eventHandlers: {
      mousedown: (e, view) => {
        let target = e.target as HTMLElement;
        const line = view.state.doc.lineAt(view.posAtDOM(target));
        console.log(target.nodeName);
        if (target.classList.contains("cm-dot")) {
          console.log("mouse down on", line);
          e.preventDefault();
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

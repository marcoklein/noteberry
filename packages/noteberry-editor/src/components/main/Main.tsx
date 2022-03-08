import { useCallback } from "react";
import { PageModel } from "../../models/PageModel";
import { PageEditor } from "./PageEditor";

interface ComponentProps {
  pages: PageModel[];
  activePage: string | undefined;
}

export function Main({ pages, activePage }: ComponentProps) {
  const lines = pages.find((page) => page.title === activePage)?.lines;

  const setLines = useCallback(
    (lines: string[]) => {
      const page = pages.find((page) => page.title === activePage);
      if (page) {
        console.log("update lines");
        page.lines = lines;
      }
    },
    [pages, activePage]
  );

  return (
    <div>
      {lines ? (
        <PageEditor lines={lines} setLines={setLines}></PageEditor>
      ) : (
        <div>Select a Page to edit</div>
      )}
    </div>
  );
}

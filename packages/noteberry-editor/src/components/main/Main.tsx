import { PageModel } from "../../models/PageModel";
import { PageEditor } from "./PageEditor";

interface ComponentProps {
  pages: PageModel[];
  activePage: string | undefined;
}

export function Main({ pages, activePage }: ComponentProps) {
  const lines = pages.find((page) => page.title === activePage)?.lines;

  return (
    <div>
      {lines ? (
        <PageEditor lines={lines}></PageEditor>
      ) : (
        <div>Select a Page to edit</div>
      )}
    </div>
  );
}

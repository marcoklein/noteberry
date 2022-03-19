import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "./components/header/Navbar";
import { Main } from "./components/main/Main";
import { Sidebar } from "./components/sidebar/Sidebar";
import { PageModel } from "./models/PageModel";

export function App() {
  const params = useParams();
  const navigateTo = useNavigate();
  const [activePage, setActivePage] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<PageModel[]>([
    { title: "Ma first page", lines: ["- Ma first page", "- is", "- cool"] },
    { title: "Ma second page", lines: ["- Ma second page", "- is", "- cool"] },
  ]);
  const untitledPageCount = useRef(1);

  useEffect(() => {
    setActivePage(params.noteId);
  }, [params, setActivePage]);

  const addPage = useCallback(() => {
    const title = `Untitled Page ${untitledPageCount.current++}`;
    setPages([
      ...pages,
      {
        title,
        lines: [`- ${title}`, "- "],
      },
    ]);
  }, [pages, setPages, untitledPageCount]);

  const selectPage = useCallback(
    (title: string) => {
      const page = pages.find((page) => page.title === title);
      if (!page) console.warn(`No page with title "${title}" existing.`);
      navigateTo(`/${title}`);
    },
    [pages, setActivePage]
  );

  return (
    <div>
      <Navbar></Navbar>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <Sidebar
          pages={pages}
          addPage={addPage}
          selectPage={selectPage}
        ></Sidebar>
        <Main pages={pages} activePage={activePage}></Main>
      </div>
    </div>
  );
}

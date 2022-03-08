import React from "react";
import { PageModel } from "../../models/PageModel";
import { Analysis } from "./Analysis";

interface ComponentProps {
  pages: PageModel[];
  addPage: () => void;
  selectPage: (title: string) => void;
}

export function Sidebar({ pages, addPage, selectPage }: ComponentProps) {
  return (
    <div style={{ backgroundColor: "#AAA", width: "12rem", padding: "0.5rem" }}>
      <div>
        <h3 style={{ display: "inline" }}>All Pages</h3>
        <button style={{ float: "right" }} onClick={() => addPage()}>
          New
        </button>
      </div>
      <ul>
        {pages.map(({ title }) => (
          <li
            key={title}
            style={{ cursor: "pointer" }}
            onClick={() => selectPage(title)}
          >
            {title}
          </li>
        ))}
      </ul>
      <Analysis pages={pages}></Analysis>
    </div>
  );
}

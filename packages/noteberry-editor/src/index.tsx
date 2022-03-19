import * as React from "react";
import * as ReactDOM from "react-dom";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { App } from "./App";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<App></App>}>
        <Route path=":noteId" element={<App></App>}></Route>
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById("app")
);

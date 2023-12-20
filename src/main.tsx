import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Layout.tsx";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Stream from "./components/Stream.tsx";
import "./main.css";
import SelectClasses from "./components/SelectClasses.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="stream" element={<Stream />} />
      <Route path="select_classes" element={<SelectClasses />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

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
import { ThemeProvider } from "@mui/material";
import theme from "./theme/theme.tsx";

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
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

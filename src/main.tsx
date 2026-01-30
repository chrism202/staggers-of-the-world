import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import AdminPage from "./components/AdminPage";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function Router() {
  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <AdminPage /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <Router />
    </ConvexProvider>
  </React.StrictMode>
);

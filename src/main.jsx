import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BlockchainProvider } from "./context/BlockchainContext.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BlockchainProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 20, 50, 0.95)",
            color: "#e0e6ff",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            backdropFilter: "blur(12px)",
            fontFamily: "Inter, sans-serif",
          },
          success: {
            iconTheme: { primary: "#00ff88", secondary: "#0a0e27" },
          },
          error: {
            iconTheme: { primary: "#ff3366", secondary: "#0a0e27" },
          },
        }}
      />
      <App />
    </BlockchainProvider>
  </React.StrictMode>
);

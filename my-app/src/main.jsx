// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./config/socketContext.jsx";
import App from "./App.jsx";
import "./index.css";
import { AuthContextProvider } from "./config/AuthContext.jsx";

// const userId = localStorage.getItem("userId")
// console.log("[USER_ID]",userId);

createRoot(document.getElementById("root")).render(
  //<StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthContextProvider>
    </BrowserRouter>
  //</StrictMode>
);

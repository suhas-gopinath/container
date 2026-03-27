import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MessageProvider } from "./shared-components/contexts/MessageContext";
import MessageDisplay from "./shared-components/components/MessageDisplay";
import { Verify } from "./components/Verify";
import "./index.css";
import "./App.css";
import Fallback from "./components/Fallback";
import { Login } from "login/Login";
import { Register } from "register/Register";

// const Login = React.lazy(() =>
//   import("login/Login").then((module) => ({
//     default: module.Login,
//   })),
// );

// const Register = React.lazy(() =>
//   import("register/Register").then((module) => ({
//     default: module.Register,
//   })),
// );

const App = () => (
  <div className="app-wrapper">
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Host Container App</h1>
        <p className="app-subtitle">Microfrontend Architecture</p>
      </header>
      <BrowserRouter>
        {/* <React.Suspense
          fallback={
            <div className="loading-container">
              <div className="loading-spinner" role="status"></div>
            </div>
          }
        > */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/verify"
            element={
              <MessageProvider>
                <MessageDisplay />
                <Verify />
              </MessageProvider>
            }
          />
          <Route path="*" element={<Fallback />} />
        </Routes>
        {/* </React.Suspense> */}
      </BrowserRouter>
    </div>
  </div>
);

const rootElement = document.getElementById("app");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

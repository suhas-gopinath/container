import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./shared-auth/store";
import { Verify } from "./components/Verify";
import "./index.css";
import "./App.css";

const Login = React.lazy(() =>
  //@ts-ignore
  import("login/Login").then((module) => ({
    default: module.Login,
  })),
);

const Register = React.lazy(() =>
  //@ts-ignore
  import("register/Register").then((module) => ({
    default: module.Register,
  })),
);

const App = () => (





































  <Provider store={store}>
    <div className="app-wrapper">
      <div className="container">
        <header className="app-header">
          <h1 className="app-title">Host Container App</h1>
          <p className="app-subtitle">Microfrontend Architecture</p>
        </header>
        <BrowserRouter>
          <React.Suspense
            fallback={
              <div className="loading-container">
                <div
                  className="loading-spinner"
                  role="status"
                  aria-label="Loading"
                ></div>
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route
                path="*"
                element={
                  <div className="fallback-container">
                    <h2 className="fallback-title">Welcome to Container App</h2>
                    <p className="fallback-message">
                      Navigate to /login, /register, or /verify to access the
                      microfrontend modules.
                    </p>
                  </div>
                }
              />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </div>
    </div>

  </Provider>
);

const rootElement = document.getElementById("app");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

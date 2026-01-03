import React from "react";
import ReactDOM from "react-dom";
import { Login } from "login/Login";
import { Register } from "register/Register";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Verify } from "./components/Verify";

const App = () => (
  <div className="container">
    Host Container app
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  </div>
);

ReactDOM.render(<App />, document.getElementById("app"));

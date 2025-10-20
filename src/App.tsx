import React from "react";
import ReactDOM from "react-dom";
import { Login } from 'login/Login';
import { Register } from 'register/Register';
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Verify } from "./Verify";
import { Button } from "@mui/material";

const App = () => (
  <div className="container">
    Host Container app
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={<div style={{ color: "green", paddingTop: "20px" }}>Success!</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  </div>

);

ReactDOM.render(<App />, document.getElementById("app"));

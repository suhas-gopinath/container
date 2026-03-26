import React from "react";
import "../App.css";

export default function Fallback() {
  return (
    <div className="fallback-container">
      <p className="fallback-message">
        Navigate to{" "}
        <a href="/login" className="fallback-link">
          /login
        </a>
        ,{" "}
        <a href="/register" className="fallback-link">
          /register
        </a>
        , or{" "}
        <a href="/verify" className="fallback-link">
          /verify
        </a>{" "}
        to access the microfrontend modules.
      </p>
    </div>
  );
}

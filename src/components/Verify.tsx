import React, { useState } from "react";
import { submit } from "../utils/submit";
import "./Verify.css";

export const Verify = () => {
  const [message, setMessage] = useState<string>("");
  return (
    <div className="verify-container">
      <div className="verify-header">
        <h1 className="verify-title">Verify</h1>
        <button
          className="logout-button"
          onClick={() => {
            sessionStorage.clear();
          }}
          aria-label="Logout from application"
        >
          Logout
        </button>
      </div>

      <div className="verify-content">
        <button
          className="verify-button"
          onClick={() => submit(setMessage)}
          aria-label="Verify JWT token"
        >
          Verify JWT v1
        </button>
        {message && (
          <div className="verify-message" role="status" aria-live="polite">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

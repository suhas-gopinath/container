import React, { useState } from "react";
import { submit } from "../utils/submit";
import "./Verify.css";

export const Verify = () => {
  const [message, setMessage] = useState<string>("");

  return (
    <div className="verify-container">
      <div className="verify-header">
        <h1 className="verify-title">Verify</h1>
        <button className="logout-button" onClick={() => {}}>
          Logout
        </button>
      </div>

      <div className="verify-content">
        <button
          className="verify-button"
          onClick={() => submit()}
          aria-label="Verify JWT token"
        >
          Verify v1 (JWT only)
        </button>

        <button className="verify-button" onClick={() => {}}>
          Verify v2 (JWT + Redis Refresh token)
        </button>

        <button className="verify-button" onClick={async () => {}}>
          Refresh
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

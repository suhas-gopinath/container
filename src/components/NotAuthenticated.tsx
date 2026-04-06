import React from "react";
import "./Verify.css";

export default function NotAuthenticated() {
  return (
    <div className="verify-container">
      <div className="verify-content">
        <div className="verify-message" role="alert">
          Not authenticated. Please log in.
        </div>
        <button
          className="verify-button"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

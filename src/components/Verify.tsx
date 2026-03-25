import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { submit } from "../utils/submit";
import { verifyV2, refreshToken, logout as logoutApi } from "../utils/authApi";
import { selectAccessToken } from "../shared-auth/store";
import type { AppDispatch } from "../shared-auth/store";
import "./Verify.css";

export const Verify = () => {
  const [message, setMessage] = useState<string>("");
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="verify-container">
      <div className="verify-header">
        <h1 className="verify-title">Verify</h1>
        <button
          className="logout-button"
          onClick={async () => {
            try {
              const data = await logoutApi(dispatch);
              setMessage(data.message);
            } catch (error) {
              setMessage("Logout failed. Please try again.");
            }
          }}
          aria-label="Logout from application"
        >
          Logout
        </button>
      </div>

      <div className="verify-content">
        <button
          className="verify-button"
          onClick={() => submit()}
          aria-label="Verify JWT token"
        >
          Verify JWT v1
        </button>

        <button
          className="verify-button"
          onClick={async () => {
            try {
              if (!accessToken) {
                setMessage(
                  "No access token in Redux. Please refresh token first.",
                );
                return;
              }
              const data = await verifyV2(accessToken);
              setMessage(data.message);
            } catch (error) {
              setMessage("Verify v2 failed. Token may be invalid or expired.");
            }
          }}
          aria-label="Verify JWT v2 token"
        >
          Verify v2 (JWT + Redis)
        </button>

        <button
          className="verify-button"
          onClick={async () => {
            try {
              const data = await refreshToken(dispatch);
              setMessage(
                data.message +
                  (data.accessToken ? " - Token stored in Redux" : ""),
              );
            } catch (error) {
              setMessage(
                "Refresh failed. Refresh token may be invalid or expired.",
              );
            }
          }}
          aria-label="Refresh access token"
        >
          Refresh Token
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

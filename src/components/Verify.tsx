import React, { useEffect, useState } from "react";
import { useApi } from "../shared-components/hooks/useApi";
import NotAuthenticated from "./NotAuthenticated";
import { useMessage } from "../shared-components/contexts/MessageContext";
import "./Verify.css";

export const Verify = () => {
  const [jwt, setJwt] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showMessage } = useMessage();

  const { callApi: verifyV1Api, isLoading: verifyV1ApiLoading } = useApi(
    "/verify/v1",
    (message) => showMessage("success", message),
    (message) => {
      showMessage("error", message);
    },
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );

  const { callApi: verifyV2Api, isLoading: verifyV2ApiLoading } = useApi(
    "/verify/v2",
    (message) => showMessage("success", message),
    (message) => {
      showMessage("error", message);
    },
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: "GET",
    },
  );

  const { callApi: refreshTokenApi, isLoading: refreshTokenApiLoading } =
    useApi(
      "/refresh",
      (message) => {
        setJwt(message);
        showMessage(
          "success",
          "Access Token refreshed successfully. It will expire in 5 mins",
        );
        setIsAuthenticated(true);
      },
      (message) => {
        showMessage("error", message);
        setIsAuthenticated(false);
      },
      {
        credentials: "include",
        method: "POST",
      },
    );

  const { callApi: logoutApi, isLoading: logoutApiLoading } = useApi(
    "/logout",
    (message) => {
      showMessage("success", message);
      setJwt("");
      setIsAuthenticated(false);
    },
    (message) => {
      showMessage("error", message);
    },
    {
      credentials: "include",
      method: "POST",
    },
  );

  useEffect(() => {
    refreshTokenApi();
  }, []);

  if (isAuthenticated === false) {
    return <NotAuthenticated />;
  }

  const isAnyApiLoading =
    verifyV1ApiLoading ||
    verifyV2ApiLoading ||
    refreshTokenApiLoading ||
    logoutApiLoading;

  return (
    <div className="verify-container">
      <div className="verify-content">
        <button
          className="logout-button"
          onClick={() => logoutApi()}
          disabled={logoutApiLoading}
        >
          {logoutApiLoading ? "Logging out..." : "Logout"}
        </button>
        <button
          className="verify-button"
          onClick={() => verifyV1Api()}
          disabled={verifyV1ApiLoading}
        >
          {verifyV1ApiLoading ? "Verifying..." : "Verify v1 (JWT only)"}
        </button>

        <button
          className="verify-button"
          onClick={() => verifyV2Api()}
          disabled={verifyV2ApiLoading}
        >
          {verifyV2ApiLoading
            ? "Verifying..."
            : "Verify v2 (JWT + Redis token)"}
        </button>

        <button
          className="verify-button"
          onClick={async () => refreshTokenApi()}
          disabled={refreshTokenApiLoading}
        >
          {refreshTokenApiLoading ? "Refreshing token..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};

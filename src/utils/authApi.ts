/**
 * Authentication API Service
 * Handles all authentication-related API calls for v2 endpoints
 *
 * IMPORTANT:
 * - Access token stored ONLY in Redux (NOT localStorage/sessionStorage)
 * - Refresh token handled via HTTP-only cookie (backend manages it)
 * - All APIs use credentials: 'include' to send cookies
 */

import { AppDispatch } from "../shared-auth/store";
import { setAccessToken, clearAccessToken } from "../shared-auth/authSlice";

/**
 * Base API URL
 * Update this to match your backend server URL
 */
const API_BASE_URL = "http://localhost:90/users";

/**
 * Verify JWT v2 - Calls GET /verify/v2 with Authorization header
 *
 * @param accessToken - JWT access token from Redux state
 * @returns MessageDto response from backend
 */
export const verifyV2 = async (
  accessToken: string,
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/v2`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only cookies
    });

    if (!response.ok) {
      throw new Error(`Verify v2 failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Verify v2 error:", error);
    throw error;
  }
};

/**
 * Refresh Token - Calls POST /refresh to get new access token
 * Uses refresh token from HTTP-only cookie (automatically sent)
 *
 * @param dispatch - Redux dispatch function to update access token in store
 * @returns MessageDto response from backend with new access token
 */
export const refreshToken = async (
  dispatch: AppDispatch,
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only refresh token cookie
    });

    if (!response.ok) {
      throw new Error(`Refresh token failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Update Redux state with new access token
    if (data.message) {
      dispatch(setAccessToken(data.message));
    }

    return data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
};

/**
 * Logout - Calls POST /logout to clear refresh token cookie
 * Also clears access token from Redux state
 *
 * @param dispatch - Redux dispatch function to clear access token from store
 * @returns MessageDto response from backend
 */
export const logout = async (
  dispatch: AppDispatch,
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only refresh token cookie
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Clear access token from Redux state
    dispatch(clearAccessToken());

    // Also clear sessionStorage for v1 compatibility
    sessionStorage.clear();

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    // Clear Redux state even if API call fails
    dispatch(clearAccessToken());
    sessionStorage.clear();
    throw error;
  }
};

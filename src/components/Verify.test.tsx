import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../shared-auth/authSlice";
import { Verify } from "./Verify";
import { submit } from "../utils/submit";
import * as authApi from "../utils/authApi";

jest.mock("../utils/submit", () => ({
  submit: jest.fn(),
}));

jest.mock("../utils/authApi");

const createMockStore = (initialState = { auth: { accessToken: null } }) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithRedux = (component: React.ReactElement, initialState?: any) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe("Verify component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls submit with setMessage when Verify JWT v1 button is clicked", () => {
    renderWithRedux(<Verify />);

    fireEvent.click(screen.getByRole("button", { name: /verify jwt token/i }));

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith();
  });

  test("calls verifyV2 when Verify v2 button is clicked with token", async () => {
    const mockVerifyV2 = authApi.verifyV2 as jest.Mock;
    mockVerifyV2.mockResolvedValue({ message: "Token verified via v2" });

    renderWithRedux(<Verify />, { auth: { accessToken: "test-token-123" } });

    fireEvent.click(
      screen.getByRole("button", { name: /verify jwt v2 token/i }),
    );

    await waitFor(() => {
      expect(mockVerifyV2).toHaveBeenCalledWith("test-token-123");
      expect(screen.getByText("Token verified via v2")).toBeInTheDocument();
    });
  });

  test("shows error message when Verify v2 clicked without token", async () => {
    renderWithRedux(<Verify />);

    fireEvent.click(
      screen.getByRole("button", { name: /verify jwt v2 token/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/no access token in redux/i)).toBeInTheDocument();
    });
  });

  test("calls refreshToken when Refresh button is clicked", async () => {
    const mockRefreshToken = authApi.refreshToken as jest.Mock;
    mockRefreshToken.mockResolvedValue({
      message: "Token refreshed",
      accessToken: "new-token-456",
    });

    renderWithRedux(<Verify />);

    fireEvent.click(
      screen.getByRole("button", { name: /refresh access token/i }),
    );

    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(
        screen.getByText(/token refreshed.*token stored in redux/i),
      ).toBeInTheDocument();
    });
  });

  test("calls logout API when Logout button is clicked", async () => {
    const mockLogout = authApi.logout as jest.Mock;
    mockLogout.mockResolvedValue({ message: "Logged out successfully" });

    renderWithRedux(<Verify />);

    fireEvent.click(
      screen.getByRole("button", { name: /logout from application/i }),
    );

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(screen.getByText("Logged out successfully")).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Verify } from "./Verify";
import { useApi } from "../shared-components/hooks/useApi";
import { useMessage } from "../shared-components/contexts/MessageContext";
import NotAuthenticated from "./NotAuthenticated";

// Mock dependencies
jest.mock("../shared-components/hooks/useApi");
jest.mock("../shared-components/contexts/MessageContext");
jest.mock("./NotAuthenticated");
jest.mock("./Verify.css", () => ({}), { virtual: true });

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
const mockUseMessage = useMessage as jest.MockedFunction<typeof useMessage>;
const mockNotAuthenticated = NotAuthenticated as jest.MockedFunction<
  typeof NotAuthenticated
>;

describe("Verify Component", () => {
  let mockShowMessage: jest.Mock;
  let mockVerifyV1Api: jest.Mock;
  let mockVerifyV2Api: jest.Mock;
  let mockRefreshTokenApi: jest.Mock;
  let mockLogoutApi: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup message context mock
    mockShowMessage = jest.fn();
    mockUseMessage.mockReturnValue({
      showMessage: mockShowMessage,
      messages: [],
      removeMessage: jest.fn(),
      clearAllMessages: jest.fn(),
    });

    // Setup API mocks
    mockVerifyV1Api = jest.fn();
    mockVerifyV2Api = jest.fn();
    mockRefreshTokenApi = jest.fn();
    mockLogoutApi = jest.fn();

    // Mock NotAuthenticated component
    mockNotAuthenticated.mockReturnValue(
      <div data-testid="not-authenticated">Not Authenticated</div>,
    );
  });

  /**
   * Helper function to setup useApi mock with default authenticated state
   * This simulates a successful refresh token call on mount
   */
  const setupAuthenticatedState = () => {
    mockUseApi.mockImplementation((path) => {
      if (path === "/verify/v1") {
        return { callApi: mockVerifyV1Api, isLoading: false };
      }
      if (path === "/verify/v2") {
        return { callApi: mockVerifyV2Api, isLoading: false };
      }
      if (path === "/refresh") {
        return { callApi: mockRefreshTokenApi, isLoading: false };
      }
      if (path === "/logout") {
        return { callApi: mockLogoutApi, isLoading: false };
      }
      return { callApi: jest.fn(), isLoading: false };
    });
  };

  /**
   * Helper function to setup useApi mock with loading states
   */
  const setupLoadingState = (loadingStates: {
    verifyV1?: boolean;
    verifyV2?: boolean;
    refreshToken?: boolean;
    logout?: boolean;
  }) => {
    mockUseApi.mockImplementation((path) => {
      if (path === "/verify/v1") {
        return {
          callApi: mockVerifyV1Api,
          isLoading: loadingStates.verifyV1 || false,
        };
      }
      if (path === "/verify/v2") {
        return {
          callApi: mockVerifyV2Api,
          isLoading: loadingStates.verifyV2 || false,
        };
      }
      if (path === "/refresh") {
        return {
          callApi: mockRefreshTokenApi,
          isLoading: loadingStates.refreshToken || false,
        };
      }
      if (path === "/logout") {
        return {
          callApi: mockLogoutApi,
          isLoading: loadingStates.logout || false,
        };
      }
      return { callApi: jest.fn(), isLoading: false };
    });
  };

  describe("Component Rendering", () => {
    it("should render NotAuthenticated component when not authenticated", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
    });

    it("should render verify container with all buttons when authenticated", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      // Simulate successful refresh token
      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }

      rerender(<Verify />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Logout/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Verify v1/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Verify v2/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Refresh/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("State Management", () => {
    it("should update jwt state when refresh token succeeds", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        refreshOnSuccess("new-jwt-token");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "success",
        "Access Token refreshed successfully!",
      );
    });

    it("should set isAuthenticated to true when refresh token succeeds", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }

      rerender(<Verify />);

      await waitFor(() => {
        expect(
          screen.queryByTestId("not-authenticated"),
        ).not.toBeInTheDocument();
      });
    });

    it("should set isAuthenticated to false when refresh token fails", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const refreshOnError = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[2];
      if (refreshOnError) {
        refreshOnError("Token refresh failed");
      }

      expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
    });

    it("should clear jwt state when logout succeeds", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      // Authenticate first
      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      // Logout
      const logoutOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/logout",
      )?.[1];
      if (logoutOnSuccess) {
        await act(async () => {
          logoutOnSuccess("Logged out successfully");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
      });
    });

    it("should set isAuthenticated to false when logout succeeds", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      const logoutOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/logout",
      )?.[1];
      if (logoutOnSuccess) {
        await act(async () => {
          logoutOnSuccess("Logged out successfully");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
      });
    });
  });

  describe("API Calls", () => {
    it("should call verifyV1Api with correct configuration", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Verify v1/i }),
        ).toBeInTheDocument();
      });

      const verifyV1Button = screen.getByRole("button", { name: /Verify v1/i });
      await user.click(verifyV1Button);

      expect(mockVerifyV1Api).toHaveBeenCalled();
    });

    it("should call verifyV2Api when Verify v2 button is clicked", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Verify v2/i }),
        ).toBeInTheDocument();
      });

      const verifyV2Button = screen.getByRole("button", { name: /Verify v2/i });
      await user.click(verifyV2Button);

      expect(mockVerifyV2Api).toHaveBeenCalled();
    });

    it("should call refreshTokenApi when Refresh button is clicked", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Refresh/i }),
        ).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole("button", { name: /Refresh/i });

      // Clear the initial mount call
      mockRefreshTokenApi.mockClear();

      await user.click(refreshButton);

      expect(mockRefreshTokenApi).toHaveBeenCalledTimes(1);
    });

    it("should call logoutApi when Logout button is clicked", async () => {
      setupAuthenticatedState();
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Logout/i }),
        ).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("button", { name: /Logout/i });
      await user.click(logoutButton);

      expect(mockLogoutApi).toHaveBeenCalled();
    });
  });

  describe("Success Callbacks", () => {
    it("should show success message when verifyV1Api succeeds", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const verifyV1OnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/verify/v1",
      )?.[1];
      if (verifyV1OnSuccess) {
        verifyV1OnSuccess("Verification v1 successful");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "success",
        "Verification v1 successful",
      );
    });

    it("should show success message when verifyV2Api succeeds", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const verifyV2OnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/verify/v2",
      )?.[1];
      if (verifyV2OnSuccess) {
        verifyV2OnSuccess("Verification v2 successful");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "success",
        "Verification v2 successful",
      );
    });

    it("should update jwt and show success message when refreshTokenApi succeeds", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        refreshOnSuccess("new-access-token");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "success",
        "Access Token refreshed successfully!",
      );
    });

    it("should show success message when logoutApi succeeds", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const logoutOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/logout",
      )?.[1];
      if (logoutOnSuccess) {
        logoutOnSuccess("Logged out successfully");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "success",
        "Logged out successfully",
      );
    });
  });

  describe("Error Handling", () => {
    it("should show error message when verifyV1Api fails", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const verifyV1OnError = mockUseApi.mock.calls.find(
        (call) => call[0] === "/verify/v1",
      )?.[2];
      if (verifyV1OnError) {
        verifyV1OnError("Verification v1 failed");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "error",
        "Verification v1 failed",
      );
    });

    it("should show error message when verifyV2Api fails", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const verifyV2OnError = mockUseApi.mock.calls.find(
        (call) => call[0] === "/verify/v2",
      )?.[2];
      if (verifyV2OnError) {
        verifyV2OnError("Verification v2 failed");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "error",
        "Verification v2 failed",
      );
    });

    it("should show error message and set isAuthenticated to false when refreshTokenApi fails", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const refreshOnError = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[2];
      if (refreshOnError) {
        refreshOnError("Token refresh failed");
      }

      expect(mockShowMessage).toHaveBeenCalledWith(
        "error",
        "Token refresh failed",
      );
      expect(screen.getByTestId("not-authenticated")).toBeInTheDocument();
    });

    it("should show error message when logoutApi fails", () => {
      setupAuthenticatedState();
      render(<Verify />);

      const logoutOnError = mockUseApi.mock.calls.find(
        (call) => call[0] === "/logout",
      )?.[2];
      if (logoutOnError) {
        logoutOnError("Logout failed");
      }

      expect(mockShowMessage).toHaveBeenCalledWith("error", "Logout failed");
    });
  });

  describe("Loading States", () => {
    it("should display loader when verifyV1Api is loading", async () => {
      setupLoadingState({ verifyV1: true });
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Verifying.../i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it("should display loader when verifyV2Api is loading", async () => {
      setupLoadingState({ verifyV2: true });
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Verifying.../i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it("should display loader when refreshTokenApi is loading", async () => {
      setupLoadingState({ refreshToken: true });
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /Refreshing token.../i,
        });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it("should display loader when logoutApi is loading", async () => {
      setupLoadingState({ logout: true });
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Logging out.../i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it("should disable buttons when their respective APIs are loading", async () => {
      setupLoadingState({ verifyV1: true, logout: true });
      const { rerender } = render(<Verify />);

      const refreshOnSuccess = mockUseApi.mock.calls.find(
        (call) => call[0] === "/refresh",
      )?.[1];
      if (refreshOnSuccess) {
        await act(async () => {
          refreshOnSuccess("mock-jwt-token");
        });
      }
      rerender(<Verify />);

      await waitFor(() => {
        const verifyV1Button = screen.getByRole("button", {
          name: /Verifying.../i,
        });
        const logoutButton = screen.getByRole("button", {
          name: /Logging out.../i,
        });
        expect(verifyV1Button).toBeDisabled();
        expect(logoutButton).toBeDisabled();
      });
    });
  });

  describe("useEffect Hook", () => {
    it("should call refreshTokenApi on component mount", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(mockRefreshTokenApi).toHaveBeenCalledTimes(1);
    });
  });

  describe("useApi Hook Configuration", () => {
    it("should configure verifyV1Api with correct endpoint and options", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(mockUseApi).toHaveBeenCalledWith(
        "/verify/v1",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
        }),
      );
    });

    it("should configure verifyV2Api with correct endpoint and options", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(mockUseApi).toHaveBeenCalledWith(
        "/verify/v2",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
        }),
      );
    });

    it("should configure refreshTokenApi with correct endpoint and options", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(mockUseApi).toHaveBeenCalledWith(
        "/refresh",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "POST",
        }),
      );
    });

    it("should configure logoutApi with correct endpoint and options", () => {
      setupAuthenticatedState();
      render(<Verify />);

      expect(mockUseApi).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "POST",
        }),
      );
    });
  });
});

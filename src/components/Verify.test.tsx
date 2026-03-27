import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Verify } from "./Verify";
import { useApi } from "../shared-components/hooks/useApi";

// Mock useApi hook
jest.mock("../shared-components/hooks/useApi");

// Mock NotAuthenticated component
jest.mock("./NotAuthenticated", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="not-authenticated">Not Authenticated Component</div>
  ),
}));

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;

describe("Verify Component - Comprehensive Functional Tests", () => {
  const mockVerifyV1Api = jest.fn();
  const mockVerifyV2Api = jest.fn();
  const mockRefreshTokenApi = jest.fn();
  const mockLogoutApi = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Initialization and useEffect Behavior", () => {
    it("should call refreshTokenApi automatically on component mount", async () => {
      mockUseApi.mockImplementation((path) => {
        if (path === "/refresh") {
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      expect(mockRefreshTokenApi).toHaveBeenCalledTimes(1);
    });

    it("should initialize with default state values", () => {
      mockUseApi.mockImplementation(() => ({
        callApi: jest.fn(),
        isLoading: false,
      }));

      render(<Verify />);

      // Component should render NotAuthenticated initially when isAuthenticated is false
      expect(screen.getByTestId("not-authenticated")).toBeDefined();
    });
  });

  describe("Authentication State Management", () => {
    it("should render NotAuthenticated component when isAuthenticated is false", () => {
      mockUseApi.mockImplementation(() => ({
        callApi: jest.fn(),
        isLoading: false,
      }));

      render(<Verify />);

      expect(screen.getByTestId("not-authenticated")).toBeDefined();
      expect(screen.queryByRole("button", { name: /logout/i })).toBe(null);
    });

    it("should render main content when isAuthenticated is true after successful token refresh", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          // Simulate successful authentication
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      expect(screen.queryByTestId("not-authenticated")).toBe(null);
    });
  });

  describe("API Success Callback Functions", () => {
    it("should update jwt, message, and isAuthenticated when refreshTokenApi success callback is triggered", async () => {
      let refreshSuccessCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          refreshSuccessCallback = onSuccess;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // Trigger success callback with JWT token
      await act(async () => {
        refreshSuccessCallback!("new-jwt-token-12345");
      });

      await waitFor(() => {
        expect(screen.getByText("Token refreshed successfully")).toBeDefined();
      });

      // Component should now show authenticated content
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });
    });

    it("should update message, clear jwt, and set isAuthenticated to false when logoutApi success callback is triggered", async () => {
      let logoutSuccessCallback: (message: string) => void;
      let refreshSuccessCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/logout") {
          logoutSuccessCallback = onSuccess;
          return { callApi: mockLogoutApi, isLoading: false };
        }
        if (path === "/refresh") {
          refreshSuccessCallback = onSuccess;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // First authenticate the user
      await act(async () => {
        refreshSuccessCallback!("mock-jwt-token");
      });

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      // Trigger logout success callback
      await act(async () => {
        logoutSuccessCallback!("Logout successful");
      });

      await waitFor(() => {
        expect(screen.getByTestId("not-authenticated")).toBeDefined();
      });
    });
  });

  describe("API Error Callback Functions", () => {
    it("should update message and set isAuthenticated to false when refreshTokenApi error callback is triggered", async () => {
      let refreshErrorCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess, onError) => {
        if (path === "/refresh") {
          refreshErrorCallback = onError;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // Trigger error callback
      await act(async () => {
        refreshErrorCallback!("Token refresh failed");
      });

      await waitFor(() => {
        expect(screen.getByTestId("not-authenticated")).toBeDefined();
      });
    });

    it("should update message when verifyV1Api error callback is triggered", async () => {
      let verifyV1ErrorCallback: (message: string) => void;
      let refreshSuccessCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess, onError) => {
        if (path === "/verify/v1") {
          verifyV1ErrorCallback = onError;
          return { callApi: mockVerifyV1Api, isLoading: false };
        }
        if (path === "/refresh") {
          refreshSuccessCallback = onSuccess;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // First authenticate the user
      await act(async () => {
        refreshSuccessCallback!("mock-jwt-token");
      });

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      // Trigger verifyV1 error callback
      await act(async () => {
        verifyV1ErrorCallback!("Verification v1 failed");
      });

      await waitFor(() => {
        expect(screen.getByText("Verification v1 failed")).toBeDefined();
      });
    });

    it("should update message when verifyV2Api error callback is triggered", async () => {
      let verifyV2ErrorCallback: (message: string) => void;
      let refreshSuccessCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess, onError) => {
        if (path === "/verify/v2") {
          verifyV2ErrorCallback = onError;
          return { callApi: mockVerifyV2Api, isLoading: false };
        }
        if (path === "/refresh") {
          refreshSuccessCallback = onSuccess;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // First authenticate the user
      await act(async () => {
        refreshSuccessCallback!("mock-jwt-token");
      });

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      // Trigger verifyV2 error callback
      await act(async () => {
        verifyV2ErrorCallback!("Verification v2 failed");
      });

      await waitFor(() => {
        expect(screen.getByText("Verification v2 failed")).toBeDefined();
      });
    });

    it("should update message when logoutApi error callback is triggered", async () => {
      let logoutErrorCallback: (message: string) => void;
      let refreshSuccessCallback: (message: string) => void;

      mockUseApi.mockImplementation((path, onSuccess, onError) => {
        if (path === "/logout") {
          logoutErrorCallback = onError;
          return { callApi: mockLogoutApi, isLoading: false };
        }
        if (path === "/refresh") {
          refreshSuccessCallback = onSuccess;
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      // First authenticate the user
      await act(async () => {
        refreshSuccessCallback!("mock-jwt-token");
      });

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      // Trigger logout error callback
      await act(async () => {
        logoutErrorCallback!("Logout failed");
      });

      await waitFor(() => {
        expect(screen.getByText("Logout failed")).toBeDefined();
      });
    });
  });

  describe("Loading States", () => {
    it("should disable and show loading text on logout button when logoutApiLoading is true", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/logout") {
          return { callApi: mockLogoutApi, isLoading: true };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("button", {
          name: /logging out/i,
        });
        expect(logoutButton).toBeDisabled();
        expect(logoutButton).toHaveTextContent("Logging out...");
      });
    });

    it("should disable and show loading text on verify v1 button when verifyV1ApiLoading is true", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/verify/v1") {
          return { callApi: mockVerifyV1Api, isLoading: true };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        const verifyButton = screen.getByRole("button", { name: /verifying/i });
        expect(verifyButton).toBeDisabled();
        expect(verifyButton).toHaveTextContent("Verifying...");
      });
    });

    it("should disable and show loading text on verify v2 button when verifyV2ApiLoading is true", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/verify/v2") {
          return { callApi: mockVerifyV2Api, isLoading: true };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        const verifyButton = screen.getByRole("button", { name: /verifying/i });
        expect(verifyButton).toBeDisabled();
        expect(verifyButton).toHaveTextContent("Verifying...");
      });
    });

    it("should disable and show loading text on refresh button when refreshTokenApiLoading is true", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: true };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        const refreshButton = screen.getByRole("button", {
          name: /refreshing token/i,
        });
        expect(refreshButton).toBeDisabled();
        expect(refreshButton).toHaveTextContent("Refreshing token...");
      });
    });
  });

  describe("Message Display Functionality", () => {
    it("should not display message div when message state is empty", async () => {
      mockUseApi.mockImplementation((path) => {
        if (path === "/refresh") {
          // Don't trigger success callback to keep message empty
          return { callApi: jest.fn(), isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      expect(screen.queryByRole("status")).toBe(null);
    });

    it("should display message div with correct content when message state is set", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        const messageDiv = screen.getByRole("status");
        expect(messageDiv).toBeDefined();
        expect(messageDiv).toHaveTextContent("Token refreshed successfully");
      });
    });
  });

  describe("User Interactions and API Calls", () => {
    it("should call verifyV1Api when verify v1 button is clicked", async () => {
      const user = userEvent.setup();

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/verify/v1") {
          return { callApi: mockVerifyV1Api, isLoading: false };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      const verifyV1Button = await screen.findByRole("button", {
        name: /verify v1 \(jwt only\)/i,
      });

      await user.click(verifyV1Button);

      expect(mockVerifyV1Api).toHaveBeenCalledTimes(1);
    });

    it("should call verifyV2Api when verify v2 button is clicked", async () => {
      const user = userEvent.setup();

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/verify/v2") {
          return { callApi: mockVerifyV2Api, isLoading: false };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      const verifyV2Button = await screen.findByRole("button", {
        name: /verify v2 \(jwt \+ redis refresh token\)/i,
      });

      await user.click(verifyV2Button);

      expect(mockVerifyV2Api).toHaveBeenCalledTimes(1);
    });

    it("should call refreshTokenApi when refresh button is clicked", async () => {
      const user = userEvent.setup();

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      const refreshButton = await screen.findByRole("button", {
        name: /^refresh$/i,
      });

      // Clear the initial mount call
      mockRefreshTokenApi.mockClear();

      await user.click(refreshButton);

      expect(mockRefreshTokenApi).toHaveBeenCalledTimes(1);
    });

    it("should call logoutApi when logout button is clicked", async () => {
      const user = userEvent.setup();

      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/logout") {
          return { callApi: mockLogoutApi, isLoading: false };
        }
        if (path === "/refresh") {
          setTimeout(() => onSuccess("mock-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      const logoutButton = await screen.findByRole("button", {
        name: /logout/i,
      });

      await user.click(logoutButton);

      expect(mockLogoutApi).toHaveBeenCalledTimes(1);
    });
  });

  describe("useApi Hook Configuration", () => {
    it("should configure verifyV1Api with correct path, credentials, method, and Authorization header", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          setTimeout(() => onSuccess("test-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      expect(mockUseApi).toHaveBeenCalledWith(
        "/verify/v1",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        }),
      );
    });

    it("should configure verifyV2Api with correct path, credentials, method, and Authorization header", async () => {
      mockUseApi.mockImplementation((path, onSuccess) => {
        if (path === "/refresh") {
          setTimeout(() => onSuccess("test-jwt-token"), 0);
          return { callApi: mockRefreshTokenApi, isLoading: false };
        }
        return { callApi: jest.fn(), isLoading: false };
      });

      render(<Verify />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logout/i })).toBeDefined();
      });

      expect(mockUseApi).toHaveBeenCalledWith(
        "/verify/v2",
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        }),
      );
    });

    it("should configure refreshTokenApi with correct path, credentials, and method", async () => {
      mockUseApi.mockImplementation(() => ({
        callApi: jest.fn(),
        isLoading: false,
      }));

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

    it("should configure logoutApi with correct path, credentials, and method", async () => {
      mockUseApi.mockImplementation(() => ({
        callApi: jest.fn(),
        isLoading: false,
      }));

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

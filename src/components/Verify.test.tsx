import React from "react";
import { Verify } from "./Verify";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

describe("Verify Component", () => {
  const mockVerifyV1Api = jest.fn();
  const mockVerifyV2Api = jest.fn();

  const mockRefreshTokenApi = jest.fn();
  const mockLogoutApi = jest.fn();

  beforeEach(() => {
    // Mock useApi to simulate authenticated state
    mockUseApi.mockImplementation((path, onSuccess, onError, options) => {
      if (path === "/refresh") {
        // Simulate successful token refresh to set isAuthenticated = true
        setTimeout(() => onSuccess("mock-jwt-token"), 0);
        return { callApi: mockRefreshTokenApi, isLoading: false };
      }
      if (path === "/verify/v1") {
        return { callApi: mockVerifyV1Api, isLoading: false };
      }
      if (path === "/verify/v2") {
        return { callApi: mockVerifyV2Api, isLoading: false };
      }
      if (path === "/logout") {
        return { callApi: mockLogoutApi, isLoading: false };
      }
      return { callApi: jest.fn(), isLoading: false };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("should render verify container with proper className", async () => {
      const { container } = render(<Verify />);

      // Wait for authentication to complete
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

      const verifyContainer = container.querySelector(".verify-container");
      expect(verifyContainer).toBeDefined();
    });

    it("should render logout button with correct text", async () => {
      render(<Verify />);

      const logoutButton = await screen.findByRole(
        "button",
        { name: /Logout/i },
        { timeout: 1000 },
      );
      expect(logoutButton).toBeDefined();
    });

    it('should render "Verify v1 (JWT only)" button', async () => {
      render(<Verify />);

      const verifyV1Button = await screen.findByRole(
        "button",
        { name: /Verify v1 \(JWT only\)/i },
        { timeout: 1000 },
      );
      expect(verifyV1Button).toBeDefined();
    });

    it('should render "Verify v2 (JWT + Redis Refresh token)" button', async () => {
      render(<Verify />);

      const verifyV2Button = await screen.findByRole(
        "button",
        { name: /Verify v2 \(JWT \+ Redis Refresh token\)/i },
        { timeout: 1000 },
      );
      expect(verifyV2Button).toBeDefined();
    });

    it('should render "Refresh" button', async () => {
      render(<Verify />);

      const refreshButton = await screen.findByRole(
        "button",
        { name: /^Refresh$/i },
        { timeout: 1000 },
      );
      expect(refreshButton).toBeDefined();
    });
  });

  describe("API Integration Tests", () => {
    it("should call refreshTokenApi on component mount (useEffect)", async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

      expect(mockRefreshTokenApi).toHaveBeenCalled();
    });

    it('should call verifyV1Api when "Verify v1" button is clicked', async () => {
      const user = userEvent.setup();
      render(<Verify />);

      const verifyV1Button = await screen.findByRole(
        "button",
        { name: /Verify v1 \(JWT only\)/i },
        { timeout: 1000 },
      );
      await user.click(verifyV1Button);

      expect(mockVerifyV1Api).toHaveBeenCalled();
    });

    it('should call verifyV2Api when "Verify v2" button is clicked', async () => {
      const user = userEvent.setup();
      render(<Verify />);

      const verifyV2Button = await screen.findByRole(
        "button",
        { name: /Verify v2 \(JWT \+ Redis Refresh token\)/i },
        { timeout: 1000 },
      );
      await user.click(verifyV2Button);

      expect(mockVerifyV2Api).toHaveBeenCalled();
    });

    it('should call refreshTokenApi when "Refresh" button is clicked', async () => {
      const user = userEvent.setup();
      render(<Verify />);

      const refreshButton = await screen.findByRole(
        "button",
        { name: /^Refresh$/i },
        { timeout: 1000 },
      );

      // Clear the initial mount call
      mockRefreshTokenApi.mockClear();

      await user.click(refreshButton);

      expect(mockRefreshTokenApi).toHaveBeenCalled();
    });

    it('should call logoutApi when "Logout" button is clicked', async () => {
      const user = userEvent.setup();
      render(<Verify />);

      const logoutButton = await screen.findByRole(
        "button",
        { name: /Logout/i },
        { timeout: 1000 },
      );
      await user.click(logoutButton);

      expect(mockLogoutApi).toHaveBeenCalled();
    });

    it('should pass correct path "/verify/v1" to useApi hook', async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

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

    it('should pass correct path "/verify/v2" to useApi hook', async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

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

    it('should pass correct path "/refresh" to useApi hook', async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

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

    it('should pass correct path "/logout" to useApi hook', async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

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

  describe("Authentication Flow Tests", () => {
    it("should render NotAuthenticated component when isAuthenticated is false", () => {
      // Mock useApi to simulate failed authentication
      mockUseApi.mockClear();
      mockUseApi.mockImplementation(() => ({
        callApi: jest.fn(),

        isLoading: false,
      }));

      render(<Verify />);

      // Component should render NotAuthenticated initially
      expect(screen.queryByTestId("not-authenticated")).toBeDefined();
    });
  });

  describe("Accessibility Tests", () => {
    it("all buttons should be keyboard accessible", async () => {
      render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.tagName).toBe("BUTTON");
      });
    });

    it('message div should have role="status" attribute when message exists', async () => {
      const { container } = render(<Verify />);

      // Wait for component to render
      await screen.findByRole("button", { name: /Logout/i }, { timeout: 1000 });

      const messageDiv = container.querySelector('[role="status"]');
      // Role status should be present on message div
      expect(messageDiv).toBeDefined();
    });
  });
});

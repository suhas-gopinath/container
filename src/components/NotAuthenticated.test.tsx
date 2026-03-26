import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NotAuthenticated from "./NotAuthenticated";

// Mock CSS import
jest.mock("./Verify.css", () => ({}), { virtual: true });

describe("NotAuthenticated Component", () => {
  let originalLocation: Location;

  beforeEach(() => {
    // Save original window.location
    originalLocation = window.location;
    // Mock window.location
    delete (window as any).location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    jest.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("should render verify-container with proper className", () => {
      const { container } = render(<NotAuthenticated />);

      const verifyContainer = container.querySelector(".verify-container");
      expect(verifyContainer).toBeInTheDocument();
    });

    it("should render verify-content div", () => {
      const { container } = render(<NotAuthenticated />);

      const verifyContent = container.querySelector(".verify-content");
      expect(verifyContent).toBeInTheDocument();
    });

    it('should render alert message "Not authenticated. Please log in."', () => {
      render(<NotAuthenticated />);

      const alertMessage = screen.getByText(
        "Not authenticated. Please log in.",
      );
      expect(alertMessage).toBeInTheDocument();
    });

    it('should render "Go to Login" button', () => {
      render(<NotAuthenticated />);

      const button = screen.getByRole("button", { name: /Go to Login/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Alert Tests", () => {
    it('alert message should have role="alert" attribute', () => {
      render(<NotAuthenticated />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Not authenticated. Please log in.");
    });

    it('alert should have className "verify-message"', () => {
      const { container } = render(<NotAuthenticated />);

      const alert = container.querySelector(".verify-message");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
    });
  });

  describe("Button Tests", () => {
    it('button should have className "verify-button"', () => {
      const { container } = render(<NotAuthenticated />);

      const button = container.querySelector(".verify-button");
      expect(button).toBeInTheDocument();
    });

    it('button should have text "Go to Login"', () => {
      render(<NotAuthenticated />);

      const button = screen.getByRole("button", { name: /Go to Login/i });
      expect(button).toHaveTextContent("Go to Login");
    });

    it("button should be clickable", () => {
      render(<NotAuthenticated />);

      const button = screen.getByRole("button", { name: /Go to Login/i });
      expect(button).toBeEnabled();
    });
  });

  describe("Navigation Tests", () => {
    it("should redirect to http://localhost:3003/login when button is clicked", async () => {
      const user = userEvent.setup();
      render(<NotAuthenticated />);

      const button = screen.getByRole("button", { name: /Go to Login/i });
      await user.click(button);

      expect(window.location.href).toBe("http://localhost:3003/login");
    });

    it("should use window.location.href for navigation", async () => {
      const user = userEvent.setup();
      render(<NotAuthenticated />);

      const initialHref = window.location.href;
      const button = screen.getByRole("button", { name: /Go to Login/i });

      await user.click(button);

      expect(window.location.href).not.toBe(initialHref);
      expect(window.location.href).toBe("http://localhost:3003/login");
    });
  });
});

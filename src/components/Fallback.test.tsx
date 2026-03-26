import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Fallback from "./Fallback";

// Mock CSS import
jest.mock("../App.css", () => ({}), { virtual: true });

describe("Fallback Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("should render fallback container with proper className", () => {
      const { container } = render(<Fallback />);

      const fallbackContainer = container.querySelector(".fallback-container");
      expect(fallbackContainer).toBeInTheDocument();
    });

    it("should render fallback message paragraph", () => {
      const { container } = render(<Fallback />);

      const fallbackMessage = container.querySelector(".fallback-message");
      expect(fallbackMessage).toBeInTheDocument();
    });

    it("should render link to /login with correct href", () => {
      render(<Fallback />);

      const loginLink = screen.getByRole("link", { name: /\/login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should render link to /register with correct href", () => {
      render(<Fallback />);

      const registerLink = screen.getByRole("link", { name: /\/register/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("should render link to /verify with correct href", () => {
      render(<Fallback />);

      const verifyLink = screen.getByRole("link", { name: /\/verify/i });
      expect(verifyLink).toBeInTheDocument();
      expect(verifyLink).toHaveAttribute("href", "/verify");
    });

    it('should render all three links with className "fallback-link"', () => {
      const { container } = render(<Fallback />);

      const fallbackLinks = container.querySelectorAll(".fallback-link");
      expect(fallbackLinks).toHaveLength(3);
    });
  });

  describe("Content Tests", () => {
    it("should display correct instructional message", () => {
      render(<Fallback />);

      const message = screen.getByText(/to access the microfrontend modules/i);
      expect(message).toBeInTheDocument();
    });

    it('should include text "Navigate to" in message', () => {
      render(<Fallback />);

      const navigateText = screen.getByText(/Navigate to/i);
      expect(navigateText).toBeInTheDocument();
    });

    it('should include text "to access the microfrontend modules" in message', () => {
      render(<Fallback />);

      const accessText = screen.getByText(
        /to access the microfrontend modules/i,
      );
      expect(accessText).toBeInTheDocument();
    });
  });

  describe("Link Tests", () => {
    it('login link should have href="/login"', () => {
      render(<Fallback />);

      const loginLink = screen.getByRole("link", { name: /\/login/i });
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it('register link should have href="/register"', () => {
      render(<Fallback />);

      const registerLink = screen.getByRole("link", { name: /\/register/i });
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it('verify link should have href="/verify"', () => {
      render(<Fallback />);

      const verifyLink = screen.getByRole("link", { name: /\/verify/i });
      expect(verifyLink).toHaveAttribute("href", "/verify");
    });

    it("all links should be clickable", () => {
      render(<Fallback />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toBeEnabled();
      });
    });
  });























});

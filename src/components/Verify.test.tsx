import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Verify } from "./Verify";
import { submit } from "../utils/submit";

jest.mock("../utils/submit", () => ({
  submit: jest.fn(),
}));

describe("Verify component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, "clear");
  });

  test("calls submit with setMessage when Verify button is clicked", () => {
    render(<Verify />);

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(expect.any(Function));
  });

  test("updates message when submit sets message", () => {
    (submit as jest.Mock).mockImplementation((setMessage: Function) => {
      setMessage("JWT verified successfully");
    });

    render(<Verify />);

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    expect(screen.getByText("JWT verified successfully")).toBeInTheDocument();
  });

  test("clears sessionStorage when Logout button is clicked", () => {
    render(<Verify />);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(Storage.prototype.clear).toHaveBeenCalledTimes(1);
  });
});

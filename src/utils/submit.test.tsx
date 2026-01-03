import { submit } from "./submit";

describe("submit()", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // mock alert
    jest.spyOn(window, "alert").mockImplementation(() => {});

    // spy sessionStorage.getItem
    jest.spyOn(Storage.prototype, "getItem");
  });

  test("calls verify API with Authorization header when JWT exists", async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValue("jwt-token-123");

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ message: "Token is valid" }),
    } as Response);

    await submit(jest.fn());

    expect(Storage.prototype.getItem).toHaveBeenCalledWith("jwt");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:90/users/verify",
      {
        headers: {
          Authorization: "Bearer jwt-token-123",
        },
      }
    );

    expect(window.alert).toHaveBeenCalledWith("Token is valid");
  });

  test("calls verify API without Authorization header when JWT does not exist", async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ message: "No token provided" }),
    } as Response);
    await submit(jest.fn());

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:90/users/verify",
      {
        headers: {
          Authorization: "",
        },
      }
    );

    expect(window.alert).toHaveBeenCalledWith("No token provided");
  });

  test("alerts generic error message when fetch throws", async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValue("jwt-token-123");
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
    await submit(jest.fn());
    expect(window.alert).toHaveBeenCalledWith("Something went worng.");
  });
});

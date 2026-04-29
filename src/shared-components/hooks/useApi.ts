import { useState } from "react";

export interface ApiOptions {
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  credentials: RequestCredentials;
}

export type ApiResponse = { message: string } | { accessToken: string };

export const useApi = (
  path: string,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
  options?: ApiOptions,
) => {
  const BASE_URL = "http://localhost:90/users";
  const [isLoading, setIsLoading] = useState(false);

  const callApi = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}${path}`, options);
      const data: ApiResponse = await response.json();

      if ("message" in data) {
        if (!response.ok) {
          onError(data.message);
          return;
        }
        onSuccess(data.message);
      }
      if ("accessToken" in data) {
        onSuccess(data.accessToken);
      }
    } catch (error: unknown) {
      onError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return { callApi, isLoading };
};

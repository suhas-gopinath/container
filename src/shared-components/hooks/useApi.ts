import { useState } from "react";

export interface ApiOptions {
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  credentials: RequestCredentials;
}

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
      const data: { message: string } = await response.json();

      if (!response.ok) {
        onError(data.message);
        return;
      }
      onSuccess(data.message);
    } catch (error: unknown) {
      onError("Service is down. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return { callApi, isLoading };
};

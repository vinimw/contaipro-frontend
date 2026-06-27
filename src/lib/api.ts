import axios from "axios";

import { clearSession, getAccessToken } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function normalizeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data as
      | { detail?: string; message?: string; errors?: unknown }
      | undefined;

    const message =
      data?.detail ??
      data?.message ??
      error.message ??
      "Nao foi possivel completar a solicitacao.";

    return new ApiError(message, status, data?.errors ?? data);
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError("Erro inesperado. Tente novamente.");
}

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export async function unwrapRequest<T>(promise: Promise<{ data: T }>) {
  const response = await promise;
  return response.data;
}

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSessionUser } from "@/lib/session-helper";

const API_TIMEOUT =
  process.env.NEXT_PUBLIC_NODE_ENV === "production" ? 5000 : 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const recoverableErrorCodes = [
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
];

const knownLogoutTriggers = [
  "no token provided",
  "token entry not found",
  "token entry expired",
  "user not found",
];

export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

function getExponentialBackoffDelay(retry: number): number {
  const base = RETRY_DELAY;
  const jitter = Math.floor(Math.random() * 300);
  return Math.min(10000, base * 2 ** retry + jitter);
}

async function getAccessToken(): Promise<string | undefined> {
  try {
    const session = await getSessionUser();
    return session?.accessToken;
  } catch (err) {
    console.error("Failed to get session:", err);
    return undefined;
  }
}

function buildHeaders(
  token?: string,
  customHeaders?: Record<string, string>,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

function handleAxiosError(error: AxiosError): Error {
  const status = error.response?.status;
  const message =
    (error.response?.data as any)?.message?.toLowerCase?.() ||
    error.message.toLowerCase();

  if (
    status &&
    knownLogoutTriggers.some((trigger) => message.includes(trigger))
  ) {
    return new SessionExpiredError(
      "Your session has expired. Redirecting to login...",
    );
  }

  return new Error(message || "Unknown error while calling the API.");
}

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any,
  config: AxiosRequestConfig & { safeRetry?: boolean } = {},
  retries = 0,
): Promise<T> {
  const token = await getAccessToken();
  const headers = buildHeaders(token, config.headers as Record<string, string>);

  try {
    const response = await axios({
      url,
      method,
      data,
      timeout: config.timeout || API_TIMEOUT,
      headers,
      ...config,
    });

    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const isRecoverable = recoverableErrorCodes.includes(error.code ?? "");
      const canRetry =
        retries < MAX_RETRIES && (config.safeRetry || method !== "POST");

      if (isRecoverable && canRetry) {
        console.warn(`Retrying [${method}] ${url}. Attempt #${retries + 1}`);
        await new Promise((resolve) =>
          setTimeout(resolve, getExponentialBackoffDelay(retries)),
        );
        return apiRequest<T>(method, url, data, config, retries + 1);
      }

      return Promise.reject(handleAxiosError(error));
    }

    return Promise.reject(new Error("Unexpected API error"));
  }
}

export const apiGet = <T>(
  url: string,
  config: AxiosRequestConfig & { safeRetry?: boolean } = {},
) => apiRequest<T>("GET", url, undefined, config);

export const apiPost = <T>(
  url: string,
  data: any,
  config: AxiosRequestConfig & { safeRetry?: boolean } = {},
) => apiRequest<T>("POST", url, data, config);

export const apiPut = <T>(
  url: string,
  data: any,
  config: AxiosRequestConfig & { safeRetry?: boolean } = {},
) => apiRequest<T>("PUT", url, data, config);

export const apiDelete = <T>(
  url: string,
  config: AxiosRequestConfig & { safeRetry?: boolean } = {},
) => apiRequest<T>("DELETE", url, undefined, config);

import axios, { AxiosRequestConfig } from "axios";
import { auth } from "@/lib/auth";
import apiRoutes from "@/lib/endpoints";

const API_TIMEOUT = 5000;

async function isServiceAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(apiRoutes.remote.health, {
      timeout: API_TIMEOUT,
    });
    return response.status === 200;
  } catch (error) {
    console.warn("Health check failed:", error.message);
    return false;
  }
}

async function getAuthorizationHeader(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken ? `Bearer ${session.accessToken}` : undefined;
}

async function apiRequest<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any,
  config: AxiosRequestConfig = {},
): Promise<T> {
  if (!(await isServiceAvailable())) {
    throw new Error("Service unavailable");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  if (
    !url.includes(apiRoutes.remote.auth.login || apiRoutes.remote.auth.register)
  ) {
    const authorizationHeader = await getAuthorizationHeader();
    if (authorizationHeader) {
      headers.Authorization = authorizationHeader;
    }
  }

  const axiosConfig: AxiosRequestConfig = {
    url,
    method,
    headers,
    data,
    timeout: config.timeout || API_TIMEOUT,
  };

  try {
    const response = await axios(axiosConfig);
    return response.data as T;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API Error (${error.code}): ${error.message} - URL: ${url}, Method: ${method}`,
      );
      throw error;
    } else {
      console.error(
        `Unexpected API Error: ${error} - URL: ${url}, Method: ${method}`,
      );
      throw new Error(`An unexpected error occurred: ${error}`);
    }
  }
}

export async function apiGet<T>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  return apiRequest<T>(url, "GET", undefined, config);
}

export async function apiPost<T>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {},
): Promise<T> {
  return apiRequest<T>(url, "POST", data, config);
}

export async function apiPut<T>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {},
): Promise<T> {
  return apiRequest<T>(url, "PUT", data, config);
}

export async function apiDelete<T>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  return apiRequest<T>(url, "DELETE", undefined, config);
}

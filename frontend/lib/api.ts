import axios from "axios";
import { auth } from "@/lib/auth";
import apiRoutes from "@/lib/endpoints";

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  let headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const serviceResponse = await axios.get(apiRoutes.remote.health, {
      timeout: 5000,
    });

    if (serviceResponse.status !== 200) {
      throw new Error("Service not available");
    }

    if (url.includes(apiRoutes.remote.auth.login)) {
      response = await fetch(url, { ...options, headers });
    } else {
      const session = await auth();
      const token = session?.user?.accessToken || "";

      headers = { ...headers, Authorization: `Bearer ${token}` };
      response = await fetch(url, { ...options, headers });
    }

    const data: T = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

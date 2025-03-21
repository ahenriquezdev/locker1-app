import { auth } from "@/lib/auth";
import remoteApi from "@/lib/endpoints";

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
    if (url.includes(remoteApi.auth.login)) {
      response = await fetch(url, { ...options, headers });
    } else {
      const session = await auth();
      const token = session?.user?.accessToken || "";

      if (
        session &&
        session.expiresAt &&
        session.expiresAt < Math.floor(Date.now() / 1000)
      ) {
        console.log("Session expired.");
        throw new Error("Session expired.");
      }

      headers = { ...headers, Authorization: `Bearer ${token}` };
      response = await fetch(url, { ...options, headers });
    }

    const data: T = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

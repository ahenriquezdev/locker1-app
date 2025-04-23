import { getSession } from "next-auth/react";
import { auth } from "@/lib/auth";

export async function getSessionUser() {
  const isServer = typeof window === "undefined";

  try {
    if (isServer) {
      const session = await auth();
      return session ?? null;
    } else {
      const session = await getSession();
      return session ?? null;
    }
  } catch (error) {
    console.error("An error occurred while getting session:", error);
    return null;
  }
}

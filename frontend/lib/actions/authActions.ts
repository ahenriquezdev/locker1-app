import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
});

export async function signInWithCredentials(credentials: any) {
  try {
    console.log("signInWithCredentials called with:", credentials);
    const parsedData = signInSchema.safeParse(credentials);

    if (!parsedData.success) {
      console.error(
        "Zod validation error:",
        parsedData.error.flatten().fieldErrors,
      );
      return {
        errors: parsedData.error.flatten().fieldErrors,
      };
    }

    const { email, password } = parsedData.data;
    console.log("Parsed data:", { email, password });

    const response = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    console.log("API response status:", response.status);

    if (response.ok) {
      const user = await response.json();

      console.log("User from API:", user);
      if (user && user.success) {
        return user.data;
      }

      console.error("Invalid user data received from API");
      return null;
    }
    console.error("API response not ok");
    return null;
  } catch (error: any) {
    console.error("Error validating credentials:", error);
    return null;
  }
}

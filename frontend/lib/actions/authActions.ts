import { z } from "zod";
import { signIn } from "next-auth/react";
import { ApiResponseType } from "@/lib/types";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
});

export async function signInWithCredentials(
  prevState: ApiResponseType,
  formData: FormData,
): Promise<ApiResponseType> {
  const parsedData = signInSchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    return {
      success: false,
      message: "Validation error",
      errors: parsedData.error.issues,
    };
  }

  const { email, password } = parsedData.data;

  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginResponse = await response.json();

    if (!loginResponse || !loginResponse.success) {
      return {
        success: false,
        message: loginResponse.message,
      };
    }

    await signIn("credentials", {
      ...loginResponse.data,
      redirect: true,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    console.log("Error: ", error);
    return {
      success: false,
      message: `Authentication error: ${error}`,
    };
  }
}

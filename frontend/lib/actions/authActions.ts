"use server";

import { z } from "zod";
import { ApiResponse } from "@/lib/types";
import { AuthError } from "next-auth";
import { apiPost } from "@/lib/api-helper";
import apiRoutes from "@/lib/endpoints";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
});

async function validateFormData(formData: FormData) {
  const parsedFormData = Object.fromEntries(formData);
  const validationResult = signInSchema.safeParse(parsedFormData);

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      errors: Object.entries(fieldErrors).flatMap(([field, messages]) =>
        messages.map((message) => ({ field, message })),
      ),
      formattedData: null,
    };
  }

  const formattedData = validationResult.data;

  return {
    errors: null,
    formattedData,
  };
}

export async function signInWithCredentials(
  prevState: ApiResponse.Response,
  formData: FormData,
): Promise<ApiResponse.Response> {
  const { errors, formattedData } = await validateFormData(formData);

  if (errors) {
    return {
      success: false,
      message: "Validation error",
      errors,
      display: true,
    };
  }

  try {
    const apiResponse = await apiPost<ApiResponse.Response>(
      apiRoutes.remote.auth.login,
      formattedData,
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Login failed.",
        display: true,
      };
    }

    return {
      success: true,
      message:
        apiResponse.message === "Login successful"
          ? "Login successful. Redirecting..."
          : apiResponse.message,
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error during login:");
  }
}

function handleError(
  error: any,
  customMessage: string = "An unexpected error occurred. Please try again later.",
) {
  console.log(customMessage, error);

  let message = customMessage;

  if (error?.message === "Service unavailable") {
    message = "The service is currently unavailable.";
  } else if (error instanceof AuthError) {
    message = "Authentication failed. Please check your credentials.";
  } else if (error?.message?.startsWith("API Error")) {
    message = `API Error: ${error.message.split(": ")[1] || "Please try again later."}`;
  } else if (error?.message?.startsWith("Unexpected API Error")) {
    message = `Unexpected Error: ${error.message.split(": ")[1] || "Please try again later."}`;
  } else {
    message =
      error?.message || "An unexpected error occurred. Please try again later.";
  }

  return {
    success: false,
    message: message,
    display: true,
  };
}

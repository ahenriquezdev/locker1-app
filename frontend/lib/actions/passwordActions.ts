"use server";

import { z } from "zod";
import { ApiResponse } from "@/lib/types";
import { getPasswordScore, getPasswordStrength } from "@/lib/utils";
import remoteApi from "@/lib/endpoints";
import { apiFetch } from "@/lib/api";
import { AuthError } from "next-auth";

const passwordSchema = z.object({
  service: z.string().min(3, "Service name must be at least 3 characters long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  score: z
    .number()
    .min(50, "Score must be a at least 50")
    .max(100, "Score must be at most 100"),
  strength: z.enum(["low", "moderate", "high", "strong"]),
});

async function validateFormData(formData: FormData) {
  const parsedFormData = Object.fromEntries(formData);

  const password = parsedFormData.password as string;
  const score = getPasswordScore(password);
  const strength = getPasswordStrength(score);

  const formattedData = {
    ...parsedFormData,
    score,
    strength,
  };

  const validationResult = passwordSchema.safeParse(formattedData);

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      errors: Object.entries(fieldErrors).flatMap(([field, messages]) =>
        messages.map((message) => ({ field, message })),
      ),
      formattedData: null,
    };
  }

  return {
    errors: null,
    formattedData: validationResult.data,
  };
}

export async function createPassword(
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

  console.log("Formatted data:", formattedData);

  try {
    const apiResponse = await apiFetch<ApiResponse.Response>(
      remoteApi.passwords.create,
      {
        method: "POST",
        body: JSON.stringify(formattedData),
      },
    );

    return {
      success: apiResponse.success,
      message:
        apiResponse.message ||
        (apiResponse.success
          ? "Password created successfully."
          : "Failed to create password."),
      errors: apiResponse.errors,
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    console.error("Error creating password:", error);

    let message = "An unexpected error occurred. Please try again later.";

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      message =
        "Unable to connect to the server. Please check your network connection.";
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message: message,
      display: true,
    };
  }
}

export async function getPasswords(): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiFetch<ApiResponse.Response>(
      remoteApi.passwords.getAll,
      {
        method: "GET",
      },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch passwords.",
        display: true,
      };
    }

    const result = apiResponse.data;

    return {
      success: true,
      message: apiResponse.message || "Password fetch successfully.",
      data: result,
      display: true,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.log("Connection error:", error);
      return {
        success: false,
        message:
          "Unable to connect to the server. Please check your network connection.",
        display: true,
      };
    } else if (error instanceof AuthError) {
      console.log("Authentication error:", error.message);
      return {
        success: false,
        message: "Authentication failed. Please check your credentials.",
        display: true,
      };
    } else {
      console.log("Unknown error:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        display: true,
      };
    }
  }
}

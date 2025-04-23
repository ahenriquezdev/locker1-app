"use server";

import { z } from "zod";
import { ApiResponse } from "@/lib/types";
import { getPasswordScore, getPasswordStrength } from "@/lib/utils";
import apiRoutes from "@/lib/endpoints";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  SessionExpiredError,
} from "@/lib/api-helper";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session-helper";

const passwordSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Password ID"),
  service: z.string().min(3, "Service name must be at least 3 characters long"),
  url: z.string().url("Invalid URL"),
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

async function validateFormData(formData: FormData, isUpdate = false) {
  const parsedFormData = Object.fromEntries(formData);

  const password = parsedFormData.password as string;
  const score = getPasswordScore(password);
  const strength = getPasswordStrength(score);

  const formattedData = {
    ...parsedFormData,
    score,
    strength,
  };

  const validationResult = !isUpdate
    ? passwordSchema.omit({ id: true }).safeParse(formattedData)
    : passwordSchema.safeParse(formattedData);

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

  try {
    const apiResponse = await apiPost<ApiResponse.Response>(
      apiRoutes.remote.password.create,
      formattedData,
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to create password.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Password created successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error creating password:");
  }
}

export async function updatePassword(
  prevState: ApiResponse.Response,
  formData: FormData,
): Promise<ApiResponse.Response> {
  const { errors, formattedData } = await validateFormData(formData, true);

  if (errors) {
    return {
      success: false,
      message: "Validation error",
      errors,
      display: true,
    };
  }

  try {
    const apiResponse = await apiPut<ApiResponse.Response>(
      apiRoutes.remote.password.updateOrDelete.replace(":id", formattedData.id),
      formattedData,
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to update password.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Password updated successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error updating password:");
  }
}

export async function deletePassword(
  formData: FormData,
): Promise<ApiResponse.Response> {
  const id = formData.get("id") as string;

  try {
    const apiResponse = await apiDelete<ApiResponse.Response>(
      apiRoutes.remote.password.updateOrDelete.replace(":id", id),
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to delete password.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Password deleted successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error deleting password:");
  }
}

export async function getPasswords(): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiGet<ApiResponse.Response>(
      apiRoutes.remote.password.getAll,
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch passwords.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Passwords fetched successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error fetching passwords:");
  }
}

export async function getPasswordById(
  passwordId: string,
): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiGet<ApiResponse.Response>(
      apiRoutes.remote.password.getById.replace(":id", passwordId),
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch password.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Password fetched successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error fetching a password:");
  }
}

export async function getPasswordCount(): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiGet<ApiResponse.Response>(
      apiRoutes.remote.password.getCount,
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch password count.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Password count fetched successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error fetching password count:");
  }
}

export async function getLastUpdated(): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiGet<ApiResponse.Response>(
      apiRoutes.remote.password.getLastUpdated,
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch recent passwords.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Recent passwords fetched successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error fetching recent passwords:");
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
  } else if (error instanceof SessionExpiredError) {
    redirect("/login");
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

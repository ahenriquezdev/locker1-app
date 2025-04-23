"use server";

import { z } from "zod";
import { ApiResponse } from "@/lib/types";
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

export async function getUserSecurityScore(): Promise<ApiResponse.Response> {
  try {
    const apiResponse = await apiGet<ApiResponse.Response>(
      apiRoutes.remote.user.getSecurityScore,
      { safeRetry: true },
    );

    if (!apiResponse || !apiResponse.success) {
      return {
        success: false,
        message: apiResponse.message || "Failed to fetch security score.",
        display: true,
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Security score fetched successfully.",
      data: apiResponse.data,
      display: true,
    };
  } catch (error: any) {
    return handleError(error, "Error fetching security score:");
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

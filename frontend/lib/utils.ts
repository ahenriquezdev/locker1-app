import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPasswordScore = (password: string): number => {
  let score = 0;

  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (length >= 8) score += 10;
  if (length >= 12) score += 5;

  if (hasUpperCase) score += 20;
  if (hasLowerCase) score += 20;
  if (hasNumbers) score += 20;
  if (hasSymbols) score += 25;

  return score;
};

export const getPasswordStrength = (
  score: number,
): "low" | "moderate" | "high" | "strong" => {
  if (score < 30) {
    return "low";
  } else if (score < 60) {
    return "moderate";
  } else if (score < 90) {
    return "high";
  } else {
    return "strong";
  }
};

export const getPasswordStrengthColor = (
  score: number,
): "red" | "orange" | "yellowgreen" | "green" => {
  if (score < 30) {
    return "red";
  } else if (score < 60) {
    return "orange";
  } else if (score < 90) {
    return "yellowgreen";
  } else {
    return "green";
  }
};

export function stringToHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex");
}

export function hexToString(hexStr: string): string {
  return Buffer.from(hexStr, "hex").toString("utf8");
}

export function formatRelativeTime(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return "Never updated";
  }

  const parsedDate = typeof date === "string" ? parseISO(date) : date;

  if (isValid(parsedDate)) {
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  }

  return "Invalid date";
}

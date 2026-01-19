import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(val: string) {
  const lowercased = String(val).toLowerCase();
  return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}

export function getInitials(name?: string | null) {
  if (!name) return "U";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.toUpperCase().slice(0, 2);
}

export function getFaviconUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } catch {
    return "";
  }
}

export const formatBytesToMB = (bytes: number | undefined) => {
  if (bytes === undefined) return "0.00";
  return (bytes / 1024 / 1024).toFixed(2);
};

// DEVELOPMENT UTILITY ONLY
export async function addNetworkDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

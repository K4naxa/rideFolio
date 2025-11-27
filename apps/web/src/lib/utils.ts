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

export function isMobile() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

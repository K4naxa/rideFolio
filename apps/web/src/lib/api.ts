import router from "@/router";
import axios, { AxiosError } from "axios";
import { toast } from "vue-sonner";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
// Known error codes
export const ErrorCodes = {
  STORAGE_LIMIT_EXCEEDED: "STORAGE_LIMIT_EXCEEDED",
  VEHICLE_LIMIT_EXCEEDED: "VEHICLE_LIMIT_EXCEEDED",
  NOT_FOUND_OR_ACCESS_DENIED: "NOT_FOUND_OR_ACCESS_DENIED",
  FORBIDDEN: "FORBIDDEN",
} as const;
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

const baseAPI = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${baseAPI}/api`,
  withCredentials: true,
});

export async function fetchApi<T>(url: string): Promise<T> {
  const response = await api.get(url);
  return response.data;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.log("API Error Interceptor triggered");
    handleApiError(error);
    return Promise.reject(error);
  },
);

function handleApiError(error: AxiosError<ApiError>): boolean {
  const apiError = error.response?.data;
  if (!apiError?.code) return false;
  switch (apiError.code) {
    case ErrorCodes.STORAGE_LIMIT_EXCEEDED:
      toast.error("Storage Limit Exceeded", {
        description: "Please upgrade your plan to continue adding data.",
        action: { label: "Upgrade", onClick: () => {} },
        duration: 8000,
      });
      return true;
    case ErrorCodes.VEHICLE_LIMIT_EXCEEDED:
      toast.error("Vehicle Limit Reached", {
        description: "Please upgrade your plan to add more vehicles.",
        action: { label: "Upgrade", onClick: () => {} },
        duration: 8000,
      });
      return true;
    case ErrorCodes.NOT_FOUND_OR_ACCESS_DENIED:
      const method = error.config?.method?.toUpperCase();
      if (method === "GET") {
        // User was trying to view something — show 404
        router.push({
          name: "not-found",
          params: { pathMatch: router.currentRoute.value.path.split("/").slice(1) },
          query: { reason: "not_found_or_denied" },
        });
      } else {
        // User was trying to do something — just toast, don't redirect
        toast.error("Not Found or Access Denied", {
          description: apiError.message || "The resource doesn't exist or you don't have access.",
        });
      }
      return true;
    case ErrorCodes.FORBIDDEN:
      toast.error("Access Denied", { description: apiError.message || "You don't have permission for this action." });
      return true;
    default:
      return false;
  }
}

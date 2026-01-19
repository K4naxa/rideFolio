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
  UNAUTHORIZED: "UNAUTHORIZED",
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
    case ErrorCodes.UNAUTHORIZED:
      toast.error("Session Expired", { description: "Please log in again." });
      router.push("/login");
      return true;
    case ErrorCodes.FORBIDDEN:
      toast.error("Access Denied", { description: apiError.message || "You don't have permission for this action." });
      return true;
    default:
      return false;
  }
}

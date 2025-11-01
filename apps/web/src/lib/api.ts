import axios from "axios";

const baseAPI = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${baseAPI}/api`,
  withCredentials: true,
});

export async function fetchApi<T>(url: string): Promise<T> {
  const response = await api.get(url);
  return response.data;
}

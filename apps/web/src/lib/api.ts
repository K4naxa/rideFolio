import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important! sends Better Auth cookies
});

export async function fetchApi<T>(url: string): Promise<T> {
  const response = await api.get(url);
  return response.data;
}

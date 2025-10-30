import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: import.meta.env.API_URL || "http://localhost:3000",
});

import { useQueryClient } from "@tanstack/vue-query";
import { createAuthClient } from "better-auth/vue";
import { emailOTPClient } from "better-auth/client/plugins";
import { computed } from "vue";
import { useRouter } from "vue-router";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export function useAuth() {
  const router = useRouter();
  const session = authClient.useSession();
  const isAuthenticated = computed(() => !!session.value?.data);
  const queryClient = useQueryClient();

  function signOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push({ name: "Login" });
          queryClient.clear();
        },
      },
    });
  }

  return {
    session: session,
    isAuthenticated,

    signOut,
  };
}

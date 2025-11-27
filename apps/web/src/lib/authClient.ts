import { createAuthClient } from "better-auth/vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

export const authClient = createAuthClient({});

export function useAuth() {
  const router = useRouter();
  const session = authClient.useSession();
  const isAuthenticated = computed(() => !!session.value?.data);

  function signOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push({ name: "login" });
        },
      },
    });
  }

  return {
    seassion: session,
    isAuthenticated,

    signOut,
  };
}

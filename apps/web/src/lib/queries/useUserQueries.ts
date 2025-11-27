import { api, fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import type { ProfileUpdateValues, TBasicProfile } from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useUser() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const currentUser = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      return fetchApi<TBasicProfile>("/users/me");
    },
    enabled: isAuthenticated,
  });

  const updateProfile = useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (data: ProfileUpdateValues) => {
      return api.patch("users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
    },
  });

  return {
    currentUser: currentUser.data,
    isLoadingUser: currentUser.isLoading,

    updateProfile: updateProfile.mutateAsync,
  };
}

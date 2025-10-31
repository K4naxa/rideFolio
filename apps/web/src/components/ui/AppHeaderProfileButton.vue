<script setup lang="ts">
import { fetchApi } from "@/lib/api";
import { authClient } from "@/lib/authClient";
import type { TBasicProfile } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { RouterLink, useRouter } from "vue-router";
import DropdownMenu from "./dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "./dropdown-menu/DropdownMenuTrigger.vue";
import Avatar from "./avatar/Avatar.vue";
import AvatarImage from "./avatar/AvatarImage.vue";
import AvatarFallback from "./avatar/AvatarFallback.vue";
import DropdownMenuContent from "./dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuGroup from "./dropdown-menu/DropdownMenuGroup.vue";
import DropdownMenuItem from "./dropdown-menu/DropdownMenuItem.vue";
import { Icons } from "../utility/icons";
import DropdownMenuSeparator from "./dropdown-menu/DropdownMenuSeparator.vue";

const router = useRouter();
function getInitials(name?: string | null) {
  if (!name) return "U";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.toUpperCase().slice(0, 2);
}

const { data: user } = useQuery({
  queryKey: ["userProfile"],
  queryFn: async () => fetchApi<TBasicProfile>("users/basicProfile"),
  staleTime: 1000 * 60 * 30, // 30min
});

function handleSignout() {
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login");
      },
    },
  });
}
</script>

<!-- TODO: add a loading skeleton for the user trigger when fetching user data -->
<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger
      class="flex items-center gap-2 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
      <Avatar class="h-8 w-8 rounded-lg">
        <AvatarImage :src="user?.image ?? ''" :alt="user?.name ?? 'User'" />
        <AvatarFallback class="rounded-lg">{{ getInitials(user?.name) }}</AvatarFallback>
      </Avatar>
      <div class="hidden lg:grid flex-1 text-left text-sm leading-tight">
        <span class="font-medium">{{ user?.name ?? "User" }}</span>
        <span class="text-muted-foreground text-xs">{{ user?.email ?? "" }}</span>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-56 rounded-lg" side="bottom" align="end">
      <DropdownMenuGroup class="">
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/profile">
            <Icons.user class="mr-2" />
            <span>Profile</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/billing">
            <Icons.billing class="mr-2" />
            <span>Billing</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild class="">
          <ThemeButton />
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="handleSignout">
        <Icons.logout class="mr-2" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

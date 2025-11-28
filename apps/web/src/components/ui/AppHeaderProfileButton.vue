<script setup lang="ts">
import { useAuth } from "@/lib/authClient";
import { RouterLink } from "vue-router";
import DropdownMenu from "./dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "./dropdown-menu/DropdownMenuTrigger.vue";
import Avatar from "./avatar/Avatar.vue";
import AvatarImage from "./avatar/AvatarImage.vue";
import AvatarFallback from "./avatar/AvatarFallback.vue";
import DropdownMenuContent from "./dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuGroup from "./dropdown-menu/DropdownMenuGroup.vue";
import DropdownMenuItem from "./dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuSeparator from "./dropdown-menu/DropdownMenuSeparator.vue";
import { useThemeStore } from "@/stores/theme";
import Icon from "../icons/Icon.vue";
import { getInitials } from "@/lib/utils";
import { useUser } from "@/lib/queries/useUserQueries";

const themeStore = useThemeStore();
const { currentUser } = useUser();
const { signOut } = useAuth();
</script>

<!-- TODO: add a loading skeleton for the user trigger when fetching user data -->
<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger
      class="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
    >
      <Avatar class="h-8 w-8 rounded-lg">
        <AvatarImage :src="currentUser?.image ?? ''" :alt="currentUser?.name ?? 'User'" />
        <AvatarFallback class="rounded-lg">{{ getInitials(currentUser?.name) }}</AvatarFallback>
      </Avatar>
      <div class="hidden flex-1 text-left text-sm leading-tight lg:grid">
        <span class="font-medium">{{ currentUser?.name ?? "User" }}</span>
        <span class="text-muted-foreground text-xs">{{ currentUser?.email ?? "" }}</span>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-44 rounded-lg" side="bottom" align="end">
      <DropdownMenuGroup class="">
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/profile">
            <Icon name="user" className="mr-2" />
            <span>Profile</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/billing">
            <Icon name="billing" className="mr-2" />
            <span>Billing</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem @click="themeStore.toggleTheme">
          <Icon name="darkMode" v-if="themeStore.resolvedTheme === 'dark'" className="mr-2" />
          <Icon name="lightMode" v-else-if="themeStore.resolvedTheme === 'light'" className="mr-2" />
          Theme
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="signOut">
        <Icon name="logout" className="mr-2" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

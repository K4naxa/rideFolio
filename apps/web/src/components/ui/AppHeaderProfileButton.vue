<script setup lang="ts">
import { useAuth } from "@/lib/authClient";
import { RouterLink, useRoute } from "vue-router";
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
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

const themeStore = useThemeStore();
const { currentUser } = useCurrentUser();
const { signOut } = useAuth();
const isMobile = useIsMobile();
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
          <RouterLink to="/profile" class="flex items-center gap-3">
            <Icon name="user" />
            <span>Profile</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/settings/preferences" class="flex items-center gap-3">
            <Icon name="settings" />
            <span>Preferences</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild class="cursor-pointer">
          <RouterLink to="/billing" class="flex items-center gap-3">
            <Icon name="billing" />
            <span>Billing</span>
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem @click="themeStore.toggleTheme" class="flex cursor-pointer items-center gap-3">
          <Icon name="darkMode" v-if="themeStore.resolvedTheme === 'dark'" />
          <Icon name="lightMode" v-else-if="themeStore.resolvedTheme === 'light'" />
          Theme
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="signOut">
        <Icon name="logout" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

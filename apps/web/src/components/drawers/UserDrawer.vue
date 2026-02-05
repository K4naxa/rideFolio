<script setup lang="ts">
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useThemeStore } from "@/stores/theme";
import { useAuth } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Icon from "@/components/icons/Icon.vue";

const themeStore = useThemeStore();
const { currentUser } = useCurrentUser();
const { signOut } = useAuth();

const route = useRoute();
const isOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
  },
);
</script>
<template>
  <Drawer v-model:open="isOpen">
    <DrawerTrigger as-child>
      <div
        variant="ghost"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
      >
        <Icon name="user" class="mb-1 size-5" />
        <span class="text-xs">user</span>
      </div>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <RouterLink to="/profile" class="flex w-full items-center gap-4 rounded">
          <Avatar class="size-10">
            <AvatarImage
              v-if="currentUser?.image"
              :src="currentUser?.image"
              :alt="currentUser?.name || 'user Avatar'"
            />
            <AvatarFallback>
              <Icon name="user" class="stroke-muted-foreground size-6" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col justify-center">
            <h2 class="leading-none">
              {{ currentUser?.name }}
            </h2>

            <p class="text-muted-foreground">
              {{ currentUser?.email }}
            </p>
          </div>
        </RouterLink>
      </DrawerHeader>

      <div class="flex flex-col gap-4 px-4 py-4">
        <RouterLink to="/profile" class="flex items-center gap-4">
          <Icon name="user" />
          <span>Profile</span>
        </RouterLink>

        <RouterLink to="/settings" class="flex items-center gap-4">
          <Icon name="settings" />
          Preferences
        </RouterLink>

        <RouterLink to="" class="flex items-center gap-4">
          <Icon name="billing" />
          <span>Billing</span>
        </RouterLink>

        <button type="button" @click="themeStore.toggleTheme" class="flex items-center gap-4">
          <Icon name="darkMode" v-if="themeStore.resolvedTheme === 'dark'" />
          <Icon name="lightMode" v-else-if="themeStore.resolvedTheme === 'light'" />
          Theme
        </button>
      </div>

      <DrawerFooter>
        <Button variant="destructive" class="w-full" @click="signOut">Log out</Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

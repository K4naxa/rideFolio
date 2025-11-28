<script setup lang="ts">
import { RouterLink } from "vue-router";
import MobileQuickAddButton from "../AuthLayout/MobileQuickAddButton.vue";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";

interface NavItem {
  name: string;
  route: string;
  icon: IconProps["name"];
}

const navItems: NavItem[] = [
  { name: "Home", route: "/dashboard", icon: "home" },
  { name: "Notes", route: "", icon: "notes" },
  { name: "Todos", route: "", icon: "todo" },
  { name: "Profile", route: "", icon: "user" },
];
</script>

<template>
  <div
    class="bottom-safe-area bg-background/80 fixed bottom-0 z-20 flex w-screen border-t px-2 shadow-md backdrop-blur-lg md:hidden"
  >
    <nav class="flex w-full items-center justify-evenly pt-2">
      <!-- First two nav items -->
      <RouterLink
        v-for="item in navItems.slice(0, 2)"
        :key="item.name"
        :to="item.route"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
      >
        <Icon :name="item.icon" class="mb-1 size-5" />
        <span class="text-xs">{{ item.name }}</span>
      </RouterLink>

      <!-- Quick Add Button in the middle -->
      <div class="flex flex-1 items-center justify-center">
        <MobileQuickAddButton />
      </div>

      <!-- Last two nav items -->
      <RouterLink
        v-for="item in navItems.slice(2)"
        :key="item.name"
        :to="item.route"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
      >
        <Icon :name="item.icon" class="mb-1 size-5" />
        <span class="text-xs">{{ item.name }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
<style>
.bottom-safe-area {
  /* Ensure it appears above other content */
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

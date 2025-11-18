<script setup lang="ts">
import { Icons } from "@/components/utility/icons";
import { RouterLink } from "vue-router";
import type { Component } from "vue";
import MobileQuickAddButton from "../AuthLayout/MobileQuickAddButton.vue";

interface NavItem {
  name: string;
  route: string;
  icon: Component;
}

const navItems: NavItem[] = [
  { name: "Home", route: "/dashboard", icon: Icons.home },
  { name: "Notes", route: "", icon: Icons.notes },
  { name: "Todos", route: "", icon: Icons.todo },
  { name: "Profile", route: "", icon: Icons.user },
];
</script>

<template>
  <div
    class="md:hidden bottom-safe-area fixed bottom-0 w-screen flex border-t bg-background/80 backdrop-blur-lg shadow-md px-2 z-20"
  >
    <nav class="flex justify-evenly items-center w-full pt-2">
      <!-- First two nav items -->
      <RouterLink
        v-for="item in navItems.slice(0, 2)"
        :key="item.name"
        :to="item.route"
        class="flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 router-link-active:text-primary"
      >
        <component :is="item.icon" class="h-5 w-5 mb-1" />
        <span class="text-xs">{{ item.name }}</span>
      </RouterLink>

      <!-- Quick Add Button in the middle -->
      <div class="flex-1 flex items-center justify-center">
        <MobileQuickAddButton />
      </div>

      <!-- Last two nav items -->
      <RouterLink
        v-for="item in navItems.slice(2)"
        :key="item.name"
        :to="item.route"
        class="flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 router-link-active:text-primary"
      >
        <component :is="item.icon" class="h-5 w-5 mb-1" />
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

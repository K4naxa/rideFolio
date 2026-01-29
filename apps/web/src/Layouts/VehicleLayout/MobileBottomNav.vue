<script setup lang="ts">
import { RouterLink } from "vue-router";
import MobileQuickAddButton from "../AuthLayout/MobileQuickAddButton.vue";
import Icon from "@/components/icons/Icon.vue";

import UserDrawer from "@/components/drawers/UserDrawer.vue";
</script>

<template>
  <div
    class="bottom-safe-area bg-background/80 fixed bottom-0 z-20 flex w-screen border-t px-2 shadow-md backdrop-blur-lg md:hidden"
  >
    <nav class="flex w-full items-center justify-evenly pt-2">
      <!-- First two nav items -->

      <RouterLink
        to="/dashboard"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="home" class="mb-1 size-5" />
        <span class="text-xs">Home</span>
      </RouterLink>

      <RouterLink
        to="/notes"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="notes" class="mb-1 size-5" />
        <span class="text-xs">Notes</span>
      </RouterLink>

      <!-- Quick Add Button in the middle -->
      <div class="flex flex-1 items-center justify-center">
        <MobileQuickAddButton />
      </div>

      <RouterLink
        to="/todos"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="todo" class="mb-1 size-5" />
        <span class="text-xs">Todos</span>
      </RouterLink>

      <UserDrawer />
    </nav>
  </div>
</template>

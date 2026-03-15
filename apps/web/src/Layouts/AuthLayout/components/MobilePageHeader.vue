<!-- components/layout/MobilePageHeader.vue -->
<script setup lang="ts">
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";
import type { HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import { useNotifications } from "@/lib/composables/useNotifications.ts";

defineProps<{
  wrapperClass?: HTMLAttributes["class"];
  hideSidebarTrigger?: boolean;
}>();

const isMobile = useIsMobile();

const { hasUnreadNotifications } = useNotifications();
</script>

<template>
  <header
    v-if="isMobile"
    class="h-AppHeader sticky top-0 z-20 flex w-screen items-center gap-2 border-none px-4 transition-[background-color,border-color,color] duration-300"
    :class="twMerge('bg-background border-b', wrapperClass)"
  >
    <!-- Left: always the sidebar trigger -->
    <div class="relative">
      <SidebarTrigger v-if="!hideSidebarTrigger" class="-ml-1 shrink-0" />

      <div v-if="hasUnreadNotifications" class="absolute top-1 right-1 flex size-2">
        <span class="relative flex size-2">
          <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span class="bg-primary/90 relative inline-flex size-2 rounded-full" />
        </span>
      </div>
    </div>

    <!-- Center: page title or custom content -->
    <div v-bind="$attrs" class="flex min-w-0 flex-1 items-center">
      <slot />
    </div>
  </header>
</template>

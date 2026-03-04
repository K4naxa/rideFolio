<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import { Primitive } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useSidebar } from "./utils";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      size?: "sm" | "md" | "normal";
      isActive?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    as: "a",
    size: "normal",
  },
);

const { setOpenMobile } = useSidebar();
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-sub-button"
    data-sidebar="menu-sub-button"
    :as="as"
    :as-child="asChild"
    :data-size="size"
    :data-active="isActive"
    @click="setOpenMobile(false)"
    :class="
      cn(
        'text-foreground ring-ring hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground' +
          ' [&>svg]:text-accent-foreground flex h-fit min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 py-0.5' +
          ' text-base outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50' +
          ' aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>

<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from "reka-ui";
import { DropdownMenuSubTrigger, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ChevronRight } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes["class"]; inset?: boolean }>();

const delegatedProps = reactiveOmit(props, "class", "inset");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuSubTrigger
    data-slot="dropdown-menu-sub-trigger"
    v-bind="forwardedProps"
    :class="
      cn(
        'focus:bg-popover-hover focus:text-sidebar-accent-foreground data-[state=open]:bg-popover-hover data-[state=open]:text-sidebar-accent-foreground flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        props.class,
      )
    "
  >
    <slot />
    <ChevronRight class="ml-auto size-4" />
  </DropdownMenuSubTrigger>
</template>

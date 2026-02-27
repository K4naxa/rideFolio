<script setup lang="ts">
import type { ScrollAreaRootProps } from "reka-ui";
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/lib/utils";
import ScrollBar from "./ScrollBar.vue";

interface Props extends ScrollAreaRootProps {
  class?: HTMLAttributes["class"];
  /**
   * When true, ScrollArea will contain itself within available parent space
   * using h-0 + grow + min-h-0 technique (prevents parent from growing)
   */
  contain?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  contain: false,
});

const delegatedProps = reactiveOmit(props, "class", "contain");
</script>

<template>
  <ScrollAreaRoot
    data-slot="scroll-area"
    v-bind="delegatedProps"
    :class="
      cn(
        'relative',
        // When contain is true, use the self-containing technique
        props.contain && 'h-0 min-h-0 grow overflow-hidden',
        props.class,
      )
    "
  >
    <ScrollAreaViewport
      data-slot="scroll-area-viewport"
      class="focus-visible:ring-ring/50 h-full w-full rounded-[inherit] pr-2 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>

<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import { useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes } from "vue";
import { DrawerContent, DrawerPortal } from "vaul-vue";
import { cn } from "@/lib/utils";
import DrawerOverlay from "./DrawerOverlay.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"]; dismissFromPill?: boolean }>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />

    <DrawerContent
      data-slot="drawer-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'group/drawer-content bg-background-light fixed z-50 flex h-auto flex-col rounded-t-lg',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm',
          'bottom-safe-area',
          props.class,
        )
      "
    >
      <!-- Floating item anchored to the top edge of the drawer -->
      <div
        class="absolute inset-x-0 -top-4 z-50 -translate-y-full px-4 transition-opacity duration-200 group-data-[state=closed]/drawer-content:opacity-0 group-data-[state=open]/drawer-content:opacity-100"
      >
        <slot name="floatingItem" />
      </div>

      <!-- Normal pill for when whole content is draggable.-->
      <div
        class="bg-muted mx-auto mt-4 hidden h-2 w-28 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        :data-vaul-handle="props.dismissFromPill ? '' : undefined"
      />

      <!-- When dismissFromPill is true, the content is draggable from the pill only, and the rest of the content should not interfere with dragging . -->
      <!-- Mostly used in forms-->
      <div
        :style="props.dismissFromPill ? 'touch-action: pan-y;' : undefined"
        :data-vaul-no-drag="props.dismissFromPill ? '' : undefined"
        class="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <slot />
      </div>
    </DrawerContent>
  </DrawerPortal>
</template>

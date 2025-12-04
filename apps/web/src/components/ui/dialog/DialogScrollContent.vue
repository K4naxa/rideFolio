<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogContent, DialogOverlay, DialogPortal, useForwardPropsEmits } from "reka-ui";
import { twMerge } from "tailwind-merge";

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="bottom-safe-area data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 backdrop-blur-sm"
    >
      <DialogContent
        :class="
          twMerge(
            'bg-background relative z-50 flex w-full min-w-0 flex-col gap-6 border-0 p-4 shadow-lg duration-200 sm:rounded-lg md:my-8 md:w-full lg:border lg:p-6',
            props.class,
          )
        "
        v-bind="forwarded"
        @pointer-down-outside="
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const target = originalEvent.target as HTMLElement;
            if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
              event.preventDefault();
            }
          }
        "
      >
        <slot />
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>

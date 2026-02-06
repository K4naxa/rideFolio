<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import { type HTMLAttributes } from "vue";
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
      :class="
        twMerge(
          'bottom-safe-area fixed inset-0 z-50 grid place-items-center overflow-x-hidden overflow-y-auto bg-black/30 backdrop-blur-sm md:p-4 lg:p-8',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:animate-in data-[state=closed]:animate-out duration-200 ease-in-out',
        )
      "
    >
      <DialogContent
        ref="dialogContentRef"
        :class="
          twMerge(
            'bg-background data relative isolate z-50 flex h-full w-full flex-1 flex-col gap-4 rounded border-0 p-4 shadow-lg sm:rounded-lg md:my-8 md:h-fit md:w-full md:border lg:p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-250',
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

<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import { DialogContent, DialogOverlay, DialogPortal, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
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
          'fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black/30 backdrop-blur-sm md:p-4',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:animate-in data-[state=closed]:animate-out duration-200 ease-in-out',
        )
      "
    >
      <DialogContent
        ref="dialogContentRef"
        :class="
          twMerge(
            'bg-card bottom-safe-area relative isolate z-50 flex h-full max-h-full w-full min-w-0 flex-col overflow-hidden rounded border-0 shadow-lg sm:rounded-lg md:my-8 md:h-fit md:max-h-[calc(100vh-4rem)] md:w-full md:border',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-250',
            'focus-visible:outline-none',
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
        <div class="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
          <slot />
        </div>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>

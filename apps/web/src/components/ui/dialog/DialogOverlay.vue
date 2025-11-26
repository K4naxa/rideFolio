<script setup lang="ts">
import type { DialogOverlayProps } from "reka-ui";
import { type HTMLAttributes, ref, onMounted, onUnmounted, computed } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogOverlay } from "reka-ui";

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const viewportHeight = ref<number | undefined>(
  typeof window !== "undefined" && window.visualViewport ? window.visualViewport.height : undefined,
);

const handleResize = () => {
  if (window.visualViewport) {
    viewportHeight.value = window.visualViewport.height;
  }
};

onMounted(() => {
  if (!window.visualViewport) return;

  window.visualViewport.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", handleResize);
  }
});

const overlayStyle = computed(() => (viewportHeight.value ? { maxHeight: `${viewportHeight.value}px` } : undefined));
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="[
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-md',
      props.class,
    ]"
    :style="overlayStyle"
  >
    <slot />
  </DialogOverlay>
</template>

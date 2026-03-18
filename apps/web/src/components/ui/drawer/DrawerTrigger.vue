<script lang="ts" setup>
import type { DrawerTriggerProps } from "vaul-vue";
import { DrawerTrigger } from "vaul-vue";

const props = defineProps<DrawerTriggerProps>();

function blurOnClick(event: MouseEvent) {
  (event.currentTarget as HTMLElement)?.blur();
}
</script>

<template>
  <DrawerTrigger data-slot="drawer-trigger" v-bind="props" @click="blurOnClick">
    <slot />
  </DrawerTrigger>
</template>

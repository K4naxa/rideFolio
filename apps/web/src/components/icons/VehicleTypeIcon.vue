<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import Icons, { type IconProps } from "./Icon.vue";

const props = defineProps<{
  type: string;
  class?: HTMLAttributes["class"];
}>();
</script>
<template>
  <Icons
    :name="type === 'other' ? 'otherVehicle' : (type as IconProps['name'])"
    :class="twMerge(`size-4`, props.class)"
  />
</template>

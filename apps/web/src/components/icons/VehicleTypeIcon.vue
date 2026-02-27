<script setup lang="ts">
import { type HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon.vue";

const props = defineProps<{
  type: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <Icon
    :name="type === 'other' ? 'otherVehicle' : (type as IconProps['name'])"
    :class="twMerge(`size-4`, props.class)"
  />
</template>

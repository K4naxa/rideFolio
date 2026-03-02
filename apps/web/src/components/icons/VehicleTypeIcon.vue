<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon.vue";
import type { IconProps } from "@/components/icons/Icon.vue";

const props = defineProps<{
  type: string;
  class?: HTMLAttributes["class"];
}>();

const iconName = computed<IconProps["name"]>(() =>
  props.type === "other" ? "otherVehicle" : (props.type as IconProps["name"]),
);
</script>

<template>
  <Icon :name="iconName" :class="twMerge(`size-4`, props.class)" />
</template>

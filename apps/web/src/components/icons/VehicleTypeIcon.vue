<script setup lang="ts">
import type { TVehicleTypeCode } from "@repo/validation";
import type { HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import Icons from "./Icon.vue";

const props = defineProps<{
  type: TVehicleTypeCode;
  class?: HTMLAttributes["class"];
}>();
</script>
<template>
  <Icons
    :name="type === 'other' ? 'otherVehicle' : type"
    :class="twMerge(`size-4  `, props.class)"
  />
</template>

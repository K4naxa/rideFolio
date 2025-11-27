<script setup lang="ts">
import type { SelectGroupProps } from "reka-ui";
import ButtonGroup from "../button-group/ButtonGroup.vue";

const props = defineProps<SelectGroupProps>();
</script>

<template>
  <ButtonGroup data-slot="select-group" v-bind="props">
    <slot />
  </ButtonGroup>
</template>

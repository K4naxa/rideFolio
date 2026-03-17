<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-muted-foreground text-xs"> {{ props.label }} </span>
    <span class="text-foreground text-sm font-medium"> {{ props.value }} </span>
  </div>
</template>

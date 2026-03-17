<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";

const props = defineProps<{
  icon?: IconProps["name"];
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="bg-muted/50 flex items-center gap-3 rounded px-3 py-2.5">
    <Icon v-if="props.icon" :name="props.icon" class="text-muted-foreground shrink-0" />

    <div class="flex flex-col">
      <!--      Label -->
      <span class="text-foreground leading-tight font-medium tabular-nums">{{ props.value }}</span>
      <span class="text-muted-foreground text-xs leading-tight"> {{ props.label }}</span>
    </div>
  </div>
</template>

<style scoped></style>

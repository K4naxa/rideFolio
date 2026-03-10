<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import type { ActionOption } from "@/lib/composables/useActionOptions";

defineProps<{ option: ActionOption }>();
</script>

<template>
  <button
    :data-cy="option.cypressDataAttr"
    class="hover:bg-popover-hover flex items-center gap-3 rounded-md px-3 py-2 text-left"
    @click="option.onClick()"
  >
    <Icon :name="option.icon" class="size-5" />
    <span class="flex flex-col">
      <span class="text-foreground text-sm leading-tight font-semibold">{{ option.label }}</span>
      <span class="text-muted-foreground text-xs leading-snug">{{ option.description }}</span>
    </span>
  </button>
</template>

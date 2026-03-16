<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import { RouterLink } from "vue-router";

defineProps<{
  title: string;
  icon?: IconProps["name"];
  showMoreTo?: string;
  showMoreLabel?: string;
}>();

defineEmits<{
  (e: "action"): void;
}>();

defineSlots<{
  default: () => void;
  action: () => void;
  empty: () => void;
}>();
</script>

<template>
  <section class="flex min-h-0 flex-col">
    <header class="mb-1 flex items-center justify-between gap-2">
      <h3 class="flex items-center gap-2">
        <Icon v-if="icon" :name="icon" class="text-muted-foreground size-4" />
        {{ title }}
      </h3>
      <div class="flex items-center gap-1">
        <slot name="action" />
        <Button v-if="showMoreTo" variant="link" size="sm" as-child class="text-muted-foreground h-auto p-0 text-xs">
          <RouterLink :to="showMoreTo" class="flex items-center gap-1">
            {{ showMoreLabel ?? "View all" }}
            <Icon name="arrowRight" class="size-3" />
          </RouterLink>
        </Button>
      </div>
    </header>
    <slot />
  </section>
</template>

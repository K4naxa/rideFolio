<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    title?: string;
    message?: string;
    refetch?: () => void;
    isFetching?: boolean;
  }>(),
  {
    title: "Unable to load data",
    message: "Something went wrong. Please try again.",
  },
);
</script>

<template>
  <div
    :class="
      cn(
        'bg-destructive/5 border-destructive/20 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center',
        props.class,
      )
    "
  >
    <div class="bg-destructive/10 grid size-10 place-items-center rounded-lg">
      <Icon name="alert" class="text-destructive size-5" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium">{{ props.title }}</p>
      <p class="text-muted-foreground text-xs">{{ props.message }}</p>
    </div>
    <Button v-if="refetch" variant="outline" size="sm" :disabled="props.isFetching" @click="props.refetch">
      <Spinner v-if="props.isFetching" class="size-3" />
      <Icon v-else name="retry" class="size-3" />
      Retry
    </Button>
  </div>
</template>

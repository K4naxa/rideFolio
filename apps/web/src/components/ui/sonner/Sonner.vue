<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :icon-size="32"
    :toast-options="{
      class: 'toaster group',

      classes: {
        success: 'toaster-success',
        toast: 'group border bg-background text-foreground shadow-lg',
        title: 'text-foreground text-base',
        description: 'text-muted-foreground',
        actionButton: 'bg-primary text-primary-foreground',
        cancelButton: 'bg-muted text-muted-foreground',
        error: 'border-destructive!  [&>svg]:fill-destructive fill-destructive!',
        warning: 'border-warning bg-warning/10 [&>svg]:text-warning',
        info: 'border-primary bg-primary/10 [&>svg]:text-primary',
      },
    }"
  />
</template>

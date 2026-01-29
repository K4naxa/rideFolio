<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import DialogClose from "./DialogClose.vue";
import { X } from "lucide-vue-next";
import Separator from "@/components/ui/separator/Separator.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div>
    <div
      data-slot="dialog-header"
      :class="cn('relative flex flex-col gap-2 pr-12 text-center sm:text-left', props.class)"
    >
      <slot />
      <DialogClose
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-0 right-0 rounded-xs opacity-70 transition-opacity hover:cursor-pointer hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <X class="size-5" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </div>
    <Separator class="mt-1" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
</script>

<template>
  <transition name="fade-skeleton" mode="out-in" appear>
    <div class="mx-2.5 flex flex-1 gap-4">
      <Skeleton class="size-11" />
      <div>
        <Skeleton class="mb-2 h-4 w-24" />
        <div class="flex gap-2.5">
          <Skeleton class="h-5 w-16" />
          <Skeleton class="h-5 w-16" />
        </div>
      </div>
      <div class="ml-auto flex items-center gap-4">
        <Skeleton class="h-4 w-18" />
        <Skeleton class="size-9" />
      </div>
    </div>
  </transition>
</template>

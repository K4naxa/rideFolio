<script setup lang="ts">
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
</script>

<template>
  <main class="flex-1 min-w-0 p-4 lg:p-8">
    <VehicleScrollArea />
    <span class="text-2xl text-red-500 overflow-auto truncate">Dashboard</span>
  </main>
</template>

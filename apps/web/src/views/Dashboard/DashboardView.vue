<script setup lang="ts">
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
import QuickLinkSection from "@/views/Dashboard/components/QuickLinkSection.vue";
</script>

<template>
  <main class="flex min-w-0 flex-1 flex-col space-y-8 p-4 lg:p-8">
    <section class="space-y-4">
      <h3>Your Vehicles</h3>
      <VehicleScrollArea size="lg" />
    </section>
    <QuickLinkSection />
  </main>
</template>

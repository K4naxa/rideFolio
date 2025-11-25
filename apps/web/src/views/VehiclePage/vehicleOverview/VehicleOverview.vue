<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
</script>
<template>
  <div class="">
    <!-- First row -->
    <div class="grid grid-cols-1 gap-4 lg:h-120 lg:grid-cols-3">
      <div class="h-full min-h-0 w-full lg:col-span-2">
        <VehicleConsumptionChart />
      </div>

      <div class="h-full min-h-0 w-full lg:col-span-1">
        <VehicleRecentActivity />
      </div>
    </div>
  </div>
</template>
<style scoped></style>

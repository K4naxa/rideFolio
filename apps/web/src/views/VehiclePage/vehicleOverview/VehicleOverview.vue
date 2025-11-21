<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
</script>
<template>
  <!-- First row -->
  <div class="flex h-120 min-h-0 w-full flex-col gap-4 lg:flex-row">
    <!--  Left  -->
    <div class="flex flex-2">
      <VehicleConsumptionChart />
    </div>

    <!-- Right -->
    <div class="flex flex-1">
      <VehicleRecentActivity />
    </div>
  </div>
</template>
<style scoped></style>

<script setup lang="ts">
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
</script>
<template>
  <!-- First row -->
  <div class="flex h-full max-h-96 min-h-0 w-full flex-col gap-4 lg:flex-row">
    <!--  Left  -->
    <div class="cardBackground flex h-full w-full flex-2 rounded border">
      <span class="text-muted-foreground mx-auto my-auto"
        >Consumption charts <br />
        30 days | 3 months | 6 months</span
      >
    </div>

    <!-- Right -->
    <div class="flex flex-1">
      <VehicleRecentActivity />
    </div>
  </div>
</template>
<style scoped></style>

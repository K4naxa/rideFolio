<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";

import OverviewTodos from "@/views/VehiclePage/vehicleOverview/components/OverviewTodos.vue";
import OverviewShoppinglist from "@/views/VehiclePage/vehicleOverview/components/OverviewShoppinglist.vue";
import OverviewNotesList from "@/views/VehiclePage/vehicleOverview/components/OverviewNotesList.vue";
</script>
<template>
  <div class="gaps-lg mb-12 flex w-full flex-col">
    <!-- First row -->

    <div class="flex h-52 min-h-0 w-full md:h-80">
      <VehicleConsumptionChart />
    </div>

    <!-- second row -->
    <div class="gaps-lg grid min-h-0 w-full lg:grid-cols-2">
      <!-- Right column -->
      <OverviewTodos />
      <OverviewShoppinglist />

      <div class="col-span-full flex w-full min-w-0">
        <OverviewNotesList />
      </div>
    </div>
  </div>
</template>

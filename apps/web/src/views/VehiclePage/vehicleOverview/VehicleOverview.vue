<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
import TodoTable from "../VehicleTodos/components/TodoTable.vue";
import ButtonGroup from "@/components/ui/button-group/ButtonGroup.vue";
import Button from "@/components/ui/button/Button.vue";
import { ref } from "vue";

const activeTable = ref<"todos" | "shoppinglist">("todos");
</script>
<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- First row -->
    <div class="h-120 min-h-0 w-full lg:col-span-2">
      <VehicleConsumptionChart />
    </div>

    <div class="h-120 min-h-0 w-full lg:col-span-1">
      <VehicleRecentActivity />
    </div>

    <!-- second row -->
    <div class="col-span-3 grid min-h-0 w-full grid-cols-2 gap-6">
      <!-- Todos -->
      <div class="flex h-100 min-h-0 w-full flex-col gap-4">
        <ButtonGroup aria-label="Button group">
          <Button
            variant="outline"
            @click="activeTable = 'todos'"
            :class="activeTable === 'todos' && 'bg-accent! font-semibold'"
          >
            To-dos
          </Button>
          <Button
            variant="outline"
            @click="activeTable = 'shoppinglist'"
            :class="activeTable === 'shoppinglist' && 'bg-accent! font-semibold'"
          >
            Shopping list
          </Button>
        </ButtonGroup>
        <TodoTable size="sm" hide-completed />
      </div>
    </div>
  </div>
</template>
<style scoped></style>

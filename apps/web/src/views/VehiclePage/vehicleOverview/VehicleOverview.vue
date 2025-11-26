<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
import TodoTable from "../VehicleTodos/components/TodoTable.vue";
import ButtonGroup from "@/components/ui/button-group/ButtonGroup.vue";
import Button from "@/components/ui/button/Button.vue";
import { ref } from "vue";
import ShoppingTable from "../vehicleShopping/components/shoppingTable.vue";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Icon from "@/components/icons/Icon.vue";

const activeTable = ref<"todos" | "shoppinglist">("todos");
</script>
<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
    <!-- First row -->
    <div class="flex h-100 min-h-0 w-full lg:col-span-2">
      <VehicleConsumptionChart />
    </div>

    <div class="h-100 min-h-0 w-full lg:col-span-1">
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

        <div class="flex min-h-0 flex-1 rounded border">
          <TodoTable v-if="activeTable === 'todos'" class="flex-1" size="sm" />
          <ShoppingTable v-else :hide-purchased="true" size="sm" />
        </div>
      </div>
    </div>

    <!-- second row -->
    <div class="col-span-3 grid w-full grid-cols-2 gap-6">
      <!-- Todos -->
      <Card class="flex h-100 w-full flex-col gap-4">
        <CardHeader>
          <CardTitle> <Icon name="todo" class="stroke-toDo" /> Todos </CardTitle>
          <CardDescription> Overview of your vehicles todos </CardDescription>
        </CardHeader>
        <CardContent class="flex min-h-0 p-0">
          <TodoTable class="flex-1" size="sm" />
        </CardContent>
      </Card>
      <Card class="flex h-100 w-full flex-col gap-4">
        <CardHeader>
          <CardTitle> <Icon name="shoppingCart" class="stroke-blue-400" /> Shopping List </CardTitle>
          <CardDescription> Overview of your vehicles todos </CardDescription>
        </CardHeader>
        <CardContent class="flex min-h-0 p-0">
          <ShoppingTable class="flex-1" size="sm" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
<style scoped></style>

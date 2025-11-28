<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import VehicleRecentActivity from "./components/VehicleRecentActivity.vue";
import TodoTable from "../VehicleTodos/components/TodoTable.vue";

import { computed, ref } from "vue";
import ShoppingTable from "../vehicleShopping/components/shoppingTable.vue";

import Tabs from "@/components/ui/tabs/Tabs.vue";
import TabsList from "@/components/ui/tabs/TabsList.vue";
import TabsTrigger from "@/components/ui/tabs/TabsTrigger.vue";
import TabsContent from "@/components/ui/tabs/TabsContent.vue";
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useShoppingQueries } from "@/lib/queries/useShoppingQueries";
import Badge from "@/components/ui/badge/Badge.vue";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Icon from "@/components/icons/Icon.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import { storeToRefs } from "pinia";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";

const { activeVehicleId } = useActiveVehicle();
const { vehicleTodos } = useTodoQueries(activeVehicleId);
const activeTab = ref<"todos" | "shoppinglist">("todos");
const pendingTodosCount = computed(() => {
  return vehicleTodos.value?.filter((todo) => !todo.isCompleted).length || 0;
});

const { vehicleShoppingList } = useShoppingQueries(activeVehicleId);
const ShoppingListCount = computed(() => {
  return vehicleShoppingList.value?.length || 0;
});

const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority } = storeToRefs(settingsStore);
</script>
<template>
  <div class="gap flex flex-col">
    <!-- First row -->
    <div class="gap grid grid-cols-1 lg:h-120 lg:grid-cols-3">
      <div class="flex h-80 min-h-0 w-full lg:col-span-2 lg:h-full">
        <VehicleConsumptionChart />
      </div>

      <div class="h-100 min-h-0 w-full lg:col-span-1 lg:h-full">
        <VehicleRecentActivity />
      </div>
    </div>

    <!-- second row -->
    <div class="w-full">
      <Tabs v-model="activeTab" class="flex h-full w-full flex-1 lg:hidden">
        <div class="flex justify-between">
          <TabsList
            class="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1"
          >
            <TabsTrigger value="todos">
              Todos <Badge variant="secondary">{{ pendingTodosCount }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="shoppinglist">
              Shopping List <Badge variant="accent">{{ ShoppingListCount }}</Badge>
            </TabsTrigger>
          </TabsList>

          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="">
                <Icon name="filter" /> <span class="hidden lg:flex">Customize columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-52">
              <DropdownMenuCheckboxItem v-model:model-value="showPriority"> Show priority </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:model-value="showDueInfo"> Show due info </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem v-model:model-value="showCompleted"> Show completed </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent value="todos">
          <div class="flex max-h-92 min-h-0 rounded border">
            <TodoTable size="sm" />
          </div>
        </TabsContent>
        <TabsContent value="shoppinglist">
          <div class="flex max-h-96 min-h-0 rounded border">
            <ShoppingTable :hide-purchased="true" size="sm" />
          </div>
        </TabsContent>
      </Tabs>

      <!-- Desktop view -->
      <div class="gap hidden min-h-0 w-full grid-cols-1 lg:grid lg:grid-cols-2">
        <Card class="flex h-100 w-full flex-col">
          <CardHeader>
            <CardTitle> <Icon name="todo" class="stroke-toDo" /> Todos </CardTitle>
            <CardDescription> Overview of your vehicles todos </CardDescription>
          </CardHeader>
          <CardContent class="flex min-h-0 p-0">
            <TodoTable class="flex-1" size="sm" />
          </CardContent>
        </Card>
        <Card class="flex h-100 w-full flex-col">
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

    <!-- second row -->
  </div>
</template>
<style scoped></style>

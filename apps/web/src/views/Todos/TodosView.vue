<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";

import Input from "@/components/ui/input/Input.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useTodosAll } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import TodoTable from "@/views/VehiclePage/VehicleTodos/components/TodoTable.vue";
import { computed, ref } from "vue";
import ResponsivePopover from "@/components/forms/ResponsivePopover.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const modalStore = useModalStore();

const { data: todos, isLoading } = useTodosAll();

const filters = ref({
  searchQuery: "",
  vehicleId: "",
  types: ["pending"] as string[],
});

const TYPE_FILTERS = [
  { type: "pending", label: "Pending" },
  { type: "completed", label: "Completed" },
];
type VehicleFilterType = (typeof TYPE_FILTERS)[number]["type"];
const allTypesActive = computed(() => filters.value.types.length === 0);
const isTypeActive = (type: VehicleFilterType) => !allTypesActive.value && filters.value.types.includes(type);
const toggleType = (type: VehicleFilterType) => {
  const current = filters.value.types;
  filters.value = {
    ...filters.value,
    types: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
  };
};

const hasFilters = computed(() => {
  return Object.values(filters.value).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));
});

const clearAllFilters = () => {
  filters.value = {
    ...filters.value,
    searchQuery: "",
    vehicleId: "",
    types: [],
  };
};

const filteredTodos = computed(() => {
  if (!todos.value) return [];

  return todos.value.filter((todo) => {
    if (filters.value.vehicleId && todo.vehicle.id !== filters.value.vehicleId) return false;

    if (filters.value.searchQuery) {
      const qr = filters.value.searchQuery.toLowerCase();
      if (!todo.title?.toLowerCase().includes(qr) && !todo.description?.toLowerCase().includes(qr)) return false;
    }

    // Type filters
    if (filters.value.types.length > 0) {
      const types = filters.value.types;
      if (types.includes("completed") && !todo.isCompleted) return false;
      if (types.includes("pending") && todo.isCompleted) return false;
    }

    return true;
  });
});
</script>
<template>
  <MainContentWrapper class="md:pt-8 lg:pt-20">
    <template #mobile-header>
      <MobilePageHeader class="justify-between">
        <span class="text-lg font-medium"> Your Todos </span>

        <div class="flex gap-2">
          <ResponsivePopover title="Filters">
            <template #trigger>
              <Button variant="outline" class="relative flex">
                <Icon name="filter" />
                <span class="hidden sm:inline">Filters</span>
                <span
                  v-if="filters.vehicleId"
                  class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
                >
                  1
                </span>
              </Button>
            </template>

            <template #content>
              <div class="gaps-sm flex flex-col md:w-sm">
                <div>
                  <VehicleSelect
                    placeholder="Filter by vehicle"
                    :value="filters.vehicleId"
                    @value-change="(value) => (filters.vehicleId = value)"
                  />
                </div>
              </div>
            </template>

            <template #footer="{ close }">
              <Button
                variant="outline"
                @click="
                  clearAllFilters();
                  close();
                "
              >
                Clear filters
              </Button>
            </template>
          </ResponsivePopover>

          <Button variant="default" size="icon" @click="modalStore.onOpen('createTodo')">
            <Icon name="plus" class="stroke-current" />
          </Button>
        </div>
      </MobilePageHeader>
    </template>

    <!-- Header -->
    <header class="mb-4 hidden justify-between gap-4 md:flex">
      <h1>Your Todos</h1>

      <Button variant="default" class="" @click="modalStore.onOpen('createTodo')">
        <Icon name="plus" class="stroke-white" />
        Create Todo
      </Button>
    </header>

    <!-- controls -->
    <div class="mb-4 flex w-full flex-col justify-between gap-4 md:flex-row">
      <!--      Type filters-->
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          class="rounded-full"
          :variant="allTypesActive ? 'default' : 'outline'"
          @click="filters.types = []"
        >
          All
        </Button>

        <Button
          v-for="type in TYPE_FILTERS"
          :key="type.type"
          size="sm"
          class="rounded-full"
          :variant="isTypeActive(type.type) ? 'default' : 'outline'"
          @click="toggleType(type.type)"
        >
          {{ type.label }}
        </Button>
      </div>

      <div class="order-first flex items-center gap-2 md:order-last">
        <Input
          v-model="filters.searchQuery"
          type="text"
          icon="search"
          class="w-full max-w-96"
          placeholder="Search from todos..."
        />
        <ResponsivePopover title="Filters">
          <template #trigger>
            <Button variant="outline" class="relative hidden h-full! md:flex">
              <Icon name="filter" />
              <span class="hidden sm:inline">Filters</span>
              <span
                v-if="filters.vehicleId"
                class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
              >
                1
              </span>
            </Button>
          </template>

          <template #content>
            <div class="gaps-sm flex flex-col md:w-sm">
              <div>
                <VehicleSelect
                  placeholder="Filter by vehicle"
                  :value="filters.vehicleId"
                  @value-change="(value) => (filters.vehicleId = value)"
                />
              </div>
            </div>
          </template>

          <template #footer="{ close }">
            <Button
              variant="outline"
              type="button"
              @click="
                clearAllFilters();
                console.log('filters: ' + JSON.stringify(filters));
                close();
              "
            >
              Clear filters
            </Button>
          </template>
        </ResponsivePopover>
      </div>
    </div>

    <div class="scrollbar-thin flex flex-1 flex-col md:overflow-y-auto">
      <!-- ── Loading skeletons ────────────────────────────────────── -->
      <div v-if="isLoading" class="flex flex-col">
        <Spinner class="mx-auto my-10" />
      </div>

      <!-- ── Empty state ──────────────────────────────────────────── -->
      <Empty v-else-if="!filteredTodos.length" class="mt-20">
        <EmptyHeader>
          <EmptyMedia variant="icon" class="bg-todo text-todo-foreground">
            <Icon name="todo" />
          </EmptyMedia>
          <EmptyTitle>No todos found</EmptyTitle>
          <EmptyDescription>
            {{ hasFilters ? "Try adjusting your filters or search query." : "Get started by creating a new todo!" }}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button v-if="hasFilters" variant="outline" size="sm" @click="clearAllFilters"> Clear filters </Button>
        </EmptyContent>
      </Empty>

      <TodoTable :todos="filteredTodos" showVehicleNames />
    </div>
  </MainContentWrapper>
</template>

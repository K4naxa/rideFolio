<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";

import Input from "@/components/ui/input/Input.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useTodosAll } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import TodoTable from "@/views/VehiclePage/VehicleTodos/components/TodoTable.vue";
import { computed } from "vue";
import ResponsivePopover from "@/components/forms/ResponsivePopover.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useFilters } from "@/lib/composables/useFilters.ts";

const modalStore = useModalStore();

const { data: todos, isLoading } = useTodosAll();

const TYPE_FILTERS = [
  { type: "pending", label: "Pending" },
  { type: "completed", label: "Completed" },
];
type TodoFilterType = (typeof TYPE_FILTERS)[number]["type"];

const {
  vehicleIdFilter,
  searchQuery,
  activeTypes,
  allTypesActive,
  isTypeActive,
  toggleType,
  hasActiveFilters,
  clearAllFilters,
  clearTypes,
} = useFilters<TodoFilterType>({ types: ["pending"], mode: "radio" });

const filteredTodos = computed(() => {
  if (!todos.value) return [];

  return todos.value.filter((todo) => {
    if (vehicleIdFilter.value && todo.vehicle.id !== vehicleIdFilter.value) return false;

    if (searchQuery.value) {
      const qr = searchQuery.value.toLowerCase();
      if (!todo.title?.toLowerCase().includes(qr) && !todo.description?.toLowerCase().includes(qr)) return false;
    }

    // Type filters
    if (activeTypes.value.length > 0) {
      const types = activeTypes.value;
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
                  v-if="vehicleIdFilter"
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
                    :value="vehicleIdFilter"
                    @value-change="(value) => (vehicleIdFilter = value)"
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
        <Button size="sm" class="rounded-full" :variant="allTypesActive ? 'default' : 'outline'" @click="clearTypes">
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
          v-model="searchQuery"
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
                v-if="vehicleIdFilter"
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
                  :value="vehicleIdFilter"
                  @value-change="(value) => (vehicleIdFilter = value)"
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
            {{
              hasActiveFilters ? "Try adjusting your filters or search query." : "Get started by creating a new todo!"
            }}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button v-if="hasActiveFilters" variant="outline" size="sm" @click="clearAllFilters"> Clear filters </Button>
        </EmptyContent>
      </Empty>

      <TodoTable :todos="filteredTodos" showVehicleNames />
    </div>
  </MainContentWrapper>
</template>

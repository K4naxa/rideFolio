<script setup lang="ts">
import { computed, ref } from "vue";
import { useModalStore } from "@/stores/modal";

import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";

import Icon from "@/components/icons/Icon.vue";
import TodoTable from "./components/TodoTable.vue";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const { currentVehicleId } = useCurrentVehicle();
const { data: todos, isLoading } = useVehicleTodos(currentVehicleId);
const modalStore = useModalStore();

const filters = ref({
  searchQuery: "",
  vehicleId: "",
  types: ["pending"] as string[],
});

const TYPE_FILTERS = [
  { type: "pending", label: "Pending" },
  { type: "completed", label: "Completed" },
] as const;

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
  <div class="flex w-full flex-1 flex-col overflow-hidden">
    <div class="mb-6 flex flex-col content-center justify-between gap-3">
      <div class="flex w-full items-center justify-between gap-4">
        <Input
          v-model="filters.searchQuery"
          type="text"
          icon="search"
          placeholder="Search todos..."
          class="w-full max-w-96"
        />
        <div class="flex content-center justify-evenly gap-4">
          <Button variant="default" class="flex-1 sm:w-auto" @click="modalStore.onOpen('createTodo')">
            <Icon name="plus" class="stroke-white" />
            <span class="hidden md:block">Create To-do</span>
          </Button>
        </div>
      </div>

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
    </div>

    <div>
      <!-- ── Loading skeletons ────────────────────────────────────── -->
      <div v-if="isLoading" class="flex flex-col">
        <Spinner class="mx-auto my-10" />
      </div>
      <!-- ── Empty state ──────────────────────────────────────────── -->
      <Empty v-if="!filteredTodos.length" class="">
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
          <Button v-if="hasFilters" variant="outline" class="" @click="clearAllFilters"> Clear filters </Button>
        </EmptyContent>
      </Empty>

      <TodoTable :todos="filteredTodos" />
    </div>
  </div>
</template>

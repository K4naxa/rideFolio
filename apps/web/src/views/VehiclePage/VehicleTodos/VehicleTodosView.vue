<script setup lang="ts">
import { computed } from "vue";
import { useModalStore } from "@/stores/modal";

import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";

import Icon from "@/components/icons/Icon.vue";
import TodoTable from "./components/TodoTable.vue";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useFilters } from "@/lib/composables/useFilters.ts";

const { currentVehicleId } = useCurrentVehicle();
const { data: todos, isLoading } = useVehicleTodos(currentVehicleId);
const modalStore = useModalStore();

const TYPE_FILTERS = [
  { type: "pending", label: "Pending" },
  { type: "completed", label: "Completed" },
];
type TodoFilterType = (typeof TYPE_FILTERS)[number]["type"];

const {
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
  <div class="flex w-full flex-1 flex-col overflow-hidden">
    <div class="mb-6 flex flex-col content-center justify-between gap-3">
      <div class="flex w-full items-center justify-between gap-4">
        <Input v-model="searchQuery" type="text" icon="search" placeholder="Search todos..." class="w-full max-w-96" />
        <div class="flex content-center justify-evenly gap-4">
          <Button variant="default" class="flex-1 sm:w-auto" @click="modalStore.onOpen('createTodo')">
            <Icon name="plus" class="stroke-white" />
            <span class="hidden md:block">Create To-do</span>
          </Button>
        </div>
      </div>

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
            {{
              hasActiveFilters ? "Try adjusting your filters or search query." : "Get started by creating a new todo!"
            }}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button v-if="hasActiveFilters" variant="outline" class="" @click="clearAllFilters"> Clear filters </Button>
        </EmptyContent>
      </Empty>

      <TodoTable :todos="filteredTodos" />
    </div>
  </div>
</template>

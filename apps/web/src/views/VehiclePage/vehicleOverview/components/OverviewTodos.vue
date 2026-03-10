<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";

import TodoInteractive from "@/components/todos/TodoInteractive.vue";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";

const { currentVehicleId } = useCurrentVehicle();
const modalStore = useModalStore();

// used for showing completed todos that have been toggled in this render
const initialRenderTime = ref(Date.now());

const { data: todos, isLoading: isTodosLoading, isError: isTodosError } = useVehicleTodos(currentVehicleId);

// Filter the list to show uncompleted todos and recently completed todos (toggled after initial render)
const displayedTodos = computed(
  () =>
    todos.value?.filter(
      (todo) =>
        !todo.isCompleted ||
        (todo?.completedData?.date && new Date(todo.completedData.date).getTime() > initialRenderTime.value),
    ) || [],
);

const isMobile = useIsMobile();
</script>
<template>
  <div class="flex h-full max-h-96 min-h-0 min-w-0 flex-col">
    <div class="flex items-center justify-between">
      <h2 class="mb-1">Todos</h2>
      <Button variant="ghost" size="icon-sm" @click="modalStore.onOpen('createTodo')"><Icon name="plus" /></Button>
    </div>

    <ScrollableNav v-if="isMobile">
      <div class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
        <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
          <Spinner class="text-muted-foreground size-10" />
        </div>
        <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
          <span class="text-destructive">Error loading todos.</span>
        </div>
        <ul
          v-else
          class="gaps-sm grid w-full grid-flow-col flex-col overflow-auto pb-2 md:flex"
          :style="{ gridTemplateRows: `repeat(${Math.min(displayedTodos.length, 3)}, minmax(0, 1fr))` }"
        >
          <TodoInteractive v-for="todo in displayedTodos" :key="todo.id" :todo="todo" />
        </ul>
      </div>
    </ScrollableNav>

    <div v-else class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
      <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
        <span class="text-destructive">Error loading todos.</span>
      </div>
      <ul
        v-else
        class="grid w-full grid-flow-col flex-col gap-2 pb-2 md:flex"
        :style="{ gridTemplateRows: `repeat(${Math.min(displayedTodos.length, 3)}, minmax(0, 1fr))` }"
      >
        <TodoInteractive v-for="todo in displayedTodos" :key="todo.id" :todo="todo" />

        <li
          class="text-muted-foreground hover:text-primary-foreground hidden cursor-pointer list-none items-center gap-4 px-1.5 py-2.5 transition-colors duration-100 md:flex"
          @click="modalStore.onOpen('createTodo')"
        >
          <Icon name="plus" class="size-4" />
          <span class="">Add new To-do</span>
        </li>
      </ul>
    </div>
  </div>
</template>

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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import FetchError from "@/components/ui/FetchError.vue";

const { currentVehicleId } = useCurrentVehicle();
const modalStore = useModalStore();

// used for showing completed todos that have been toggled in this render
const initialRenderTime = ref(Date.now());

const {
  data: todos,
  isLoading: isTodosLoading,
  isError: isTodosError,
  isFetching,
  refetch,
} = useVehicleTodos(currentVehicleId);

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

    <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
      <Spinner class="text-muted-foreground size-10" />
    </div>

    <FetchError v-else-if="isTodosError" title="Failed to load to-dos" :refetch :isFetching />

    <Empty v-else-if="displayedTodos.length === 0" class="card">
      <EmptyHeader>
        <EmptyTitle>No pending to-dos</EmptyTitle>
        <EmptyDescription>Create one to start tracking tasks.</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <ScrollableNav v-else-if="isMobile">
      <div class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
        <ul
          class="gaps-sm grid w-full grid-flow-col flex-col overflow-auto pb-2 md:flex"
          :style="{ gridTemplateRows: `repeat(${Math.min(displayedTodos.length, 3)}, minmax(0, 1fr))` }"
        >
          <TodoInteractive v-for="todo in displayedTodos" :key="todo.id" :todo="todo" />
        </ul>
      </div>
    </ScrollableNav>

    <div v-else class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
      <ul
        class="grid w-full grid-flow-col flex-col gap-2 pb-2 md:flex"
        :style="{ gridTemplateRows: `repeat(${Math.min(displayedTodos.length, 3)}, minmax(0, 1fr))` }"
      >
        <TodoInteractive v-for="todo in displayedTodos" :key="todo.id" :todo="todo" />
      </ul>
    </div>
  </div>
</template>

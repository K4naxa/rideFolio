<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import TodoInteractive from "@/components/todos/TodoInteractive.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import FetchError from "@/components/ui/FetchError.vue";
import { useTodosAll } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import DashboardSection from "./DashboardSection.vue";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const modalStore = useModalStore();
const initialRenderTime = ref(Date.now());

const { data: todos, isLoading, isError, isFetching, refetch } = useTodosAll();

// Show uncompleted todos (due first, then by creation), plus recently toggled
const displayedTodos = computed(() => {
  if (!todos.value) return [];
  return todos.value
    .filter(
      (todo) =>
        !todo.isCompleted ||
        (todo?.completedData?.date && new Date(todo.completedData.date).getTime() > initialRenderTime.value),
    )
    .sort((a, b) => {
      // Due todos first
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b?.dueDate) return 1;
      // Among due todos, earliest due first
      if (a?.dueDate && b.dueDate) {
        return new Date(a.dueDate?.date).getTime() - new Date(b.dueDate?.date).getTime();
      }
      // Then by creation order
      return new Date(a.createdData.date).getTime() - new Date(b.createdData.date).getTime();
    });
});

const MAX_ITEMS = 6;
</script>

<template>
  <DashboardSection title="To-dos" icon="todo" show-more-to="/todos">
    <template #action>
      <Button variant="ghost" size="icon-sm" @click="modalStore.onOpen('createTodo')">
        <Icon name="plus" />
      </Button>
    </template>

    <div class="scrollbar-macos max-h-96 overflow-y-auto">
      <div v-if="isLoading" class="grid h-32 place-items-center">
        <Spinner class="text-muted-foreground size-8" />
      </div>
      <FetchError v-else-if="isError" title="Failed to load to-dos" :refetch :isFetching />
      <Empty v-else-if="displayedTodos.length === 0" class="card">
        <EmptyHeader>
          <EmptyTitle>No pending to-dos</EmptyTitle>
          <EmptyDescription>Create one to start tracking tasks.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <ul v-else class="flex flex-col gap-2">
        <TodoInteractive v-for="todo in displayedTodos.slice(0, MAX_ITEMS)" :key="todo.id" :todo="todo" show-vehicle />
      </ul>
    </div>
  </DashboardSection>
</template>

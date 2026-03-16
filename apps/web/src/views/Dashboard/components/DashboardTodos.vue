<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import TodoInteractive from "@/components/todos/TodoInteractive.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useTodosAll } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import DashboardSection from "./DashboardSection.vue";

const modalStore = useModalStore();
const initialRenderTime = ref(Date.now());

const { data: todos, isLoading, isError } = useTodosAll();

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
      if (a.dueInfo?.dueDate && !b.dueInfo?.dueDate) return -1;
      if (!a.dueInfo?.dueDate && b.dueInfo?.dueDate) return 1;
      // Among due todos, earliest due first
      if (a.dueInfo?.dueDate && b.dueInfo?.dueDate) {
        return new Date(a.dueInfo.dueDate).getTime() - new Date(b.dueInfo.dueDate).getTime();
      }
      // Then by creation order
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
      <div v-else-if="isError" class="grid h-32 place-items-center">
        <span class="text-destructive text-sm">Failed to load todos.</span>
      </div>
      <div v-else-if="displayedTodos.length === 0" class="grid h-32 place-items-center text-center">
        <div class="space-y-1">
          <p class="text-muted-foreground text-sm">No pending to-dos</p>
          <p class="text-muted-foreground/70 text-xs">Create one to start tracking tasks.</p>
        </div>
      </div>
      <ul v-else class="flex flex-col gap-2">
        <TodoInteractive
          v-for="todo in displayedTodos.slice(0, MAX_ITEMS)"
          :key="todo.id"
          :todo="todo"
          show-vehicle
        />
      </ul>
    </div>
  </DashboardSection>
</template>

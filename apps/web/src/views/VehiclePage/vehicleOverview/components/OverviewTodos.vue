<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";

const { currentVehicleId } = useCurrentVehicle();
const modalStore = useModalStore();

// used for showing completed todos that have been toggled in this render
const initialRenderTime = ref(Date.now());

const { data: todos, isLoading: isTodosLoading, isError: isTodosError } = useVehicleTodos(currentVehicleId);
const { mutate: toggleTodo } = useTodoToggle();

// Filtered list to show uncompleted todos and recently completed todos (toggled after initial render)
const displayedTodos = computed(
  () =>
    todos.value?.filter(
      (todo) =>
        !todo.isCompleted ||
        (todo?.completedData?.date && new Date(todo.completedData.date).getTime() > initialRenderTime.value),
    ) || [],
);
</script>
<template>
  <div class="flex h-full max-h-96 min-h-0 flex-col">
    <h2 class="mb-1">Todos</h2>
    <Separator class="mb-2" />
    <div class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
      <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
        <span class="text-destructive">Error loading todos.</span>
      </div>
      <Empty v-else-if="displayedTodos.length === 0">
        <EmptyTitle>No pending todos</EmptyTitle>
        <EmptyDescription class="text-center"> You have completed all your todos for this vehicle. </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" @click="modalStore.onOpen('createTodo')"> Create new </Button>
        </EmptyContent>
      </Empty>
      <ul v-else class="flex w-full flex-col gap-4">
        <li v-for="todo in displayedTodos" :key="todo.id" class="group flex items-center gap-4">
          <Checkbox
            :model-value="todo.isCompleted"
            @update:model-value="
              toggleTodo({
                todoId: todo.id,
                complete: !todo.isCompleted,
              })
            "
            class="group-hover:bg-accent/10 group-hover:border-foreground/50 size-6 bg-transparent"
            variant="secondary"
          />
          <div class="flex flex-col gap-0">
            <span
              class="w-fit leading-tight line-through"
              :class="todo.isCompleted && 'text-muted-foreground purchased'"
            >
              {{ todo.title }}
            </span>
            <span class="text-muted-foreground text-sm" :class="todo.isCompleted && 'purchased'">
              {{ todo.description }}
            </span>
          </div>
        </li>

        <li
          class="text-muted-foreground hover:text-primary-foreground flex cursor-pointer list-none items-center gap-4 px-1.5 py-2.5 transition-colors duration-100"
          @click="modalStore.onOpen('createTodo')"
        >
          <Icon name="plus" class="size-4" />
          <span class="">Add new To-do</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.line-through {
  text-decoration: none;
  position: relative;
}
.line-through::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.1s ease-in-out;
  transform-origin: left;
}
.line-through.purchased::after {
  transform: scaleX(1);
}
</style>

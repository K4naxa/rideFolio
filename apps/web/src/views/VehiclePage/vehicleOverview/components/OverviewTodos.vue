<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import TodoActivityPreviewItem from "@/components/previews/todo/TodoActivityPreviewItem.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";

import TodoItem from "@/components/todos/TodoItem.vue";

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
</script>
<template>
  <div class="flex h-full max-h-96 min-h-0 min-w-0 flex-col">
    <h2 class="mb-1">Todos</h2>
    <ScrollableNav>
      <div class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
        <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
          <Spinner class="text-muted-foreground size-10" />
        </div>
        <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
          <span class="text-destructive">Error loading todos.</span>
        </div>
        <ul
          v-else
          class="gaps-sm grid w-full grid-flow-col flex-col overflow-x-auto pb-2 md:flex"
          :style="{ gridTemplateRows: `repeat(${Math.min(displayedTodos.length, 3)}, minmax(0, 1fr))` }"
        >
          <Dialog v-for="todo in displayedTodos" :key="todo.id" v-slot="{ close }">
            <DialogTrigger as-child>
              <TodoItem :todo="todo" />
            </DialogTrigger>

            <DialogContent class="max-w-xl">
              <TodoActivityPreviewItem :activity="todo" @close="close" />
            </DialogContent>
          </Dialog>
          <li
            class="text-muted-foreground hover:text-primary-foreground hidden cursor-pointer list-none items-center gap-4 px-1.5 py-2.5 transition-colors duration-100 md:flex"
            @click="modalStore.onOpen('createTodo')"
          >
            <Icon name="plus" class="size-4" />
            <span class="">Add new To-do</span>
          </li>
        </ul>
      </div>
    </ScrollableNav>
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

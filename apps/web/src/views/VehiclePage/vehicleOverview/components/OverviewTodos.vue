<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import TodoActivityPreviewItem from "@/components/previews/todo/TodoActivityPreviewItem.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { capitalize } from "@/lib/utils";
import { useModalStore } from "@/stores/modal";
import { useTimeAgoIntl } from "@vueuse/core";
import { twMerge } from "tailwind-merge";
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

const isMobile = useIsMobile();
</script>
<template>
  <div class="flex h-full max-h-96 min-h-0 min-w-0 flex-col">
    <h2 class="mb-1">Todos</h2>
    <Separator class="mb-2" />
    <div class="scrollbar-macos flex overflow-y-auto py-2 lg:h-full">
      <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
        <span class="text-destructive">Error loading todos.</span>
      </div>
      <ul
        v-else
        class="scrollbar-macos grid w-full grid-flow-col grid-rows-2 flex-col gap-4 overflow-x-auto pb-2 md:flex"
      >
        <Dialog v-for="todo in displayedTodos" :key="todo.id" v-slot="{ close }">
          <DialogTrigger v-if="isMobile" as-child>
            <div
              :class="
                twMerge(
                  'group listHover flex w-82 gap-4 rounded p-3 md:max-h-full md:w-full',
                  (todo.dueDate?.overdue || todo.dueOdometer?.overdue) && !todo.isCompleted && 'bg-destructive/20!',
                )
              "
            >
              <!-- Left section -->
              <Checkbox
                :model-value="todo.isCompleted"
                @click.stop
                @update:model-value="
                  toggleTodo({
                    todoId: todo.id,
                    complete: !todo.isCompleted,
                  })
                "
                class="group-hover:bg-accent/10 group-hover:border-foreground/50 my-auto size-6 bg-transparent"
                variant="secondary"
              />

              <!-- Right section -->
              <div class="flex w-full flex-col gap-1">
                <!-- title / priority -->
                <div class="flex w-full justify-between gap-4">
                  <h3
                    class="w-fit truncate line-through"
                    :class="todo.isCompleted && 'text-muted-foreground purchased'"
                  >
                    {{ todo.title }}
                  </h3>

                  <Badge
                    v-if="todo.priority"
                    variant="outline"
                    :class="twMerge('priority-' + todo.priority, 'text-xs')"
                  >
                    {{ capitalize(todo.priority || "") }}
                  </Badge>
                </div>

                <!-- Description -->
                <span
                  v-if="todo.description"
                  class="text-muted-foreground hidden overflow-hidden text-start text-sm md:block"
                  :class="todo.isCompleted && 'purchased'"
                >
                  {{ todo.description }}
                </span>

                <!-- Overdue -->
                <div class="mt-auto flex items-center gap-2 text-sm">
                  <p class="text-end">
                    <span class="text-muted-foreground mr-2">Due</span>
                    <span v-if="todo.dueDate?.date" :class="twMerge(todo.dueDate?.overdue && 'text-destructive')">{{
                      useTimeAgoIntl(new Date(todo.dueDate.date))
                    }}</span>
                  </p>
                  <p v-if="todo.dueOdometer">/ {{ todo.dueOdometer?.remaining }} {{ todo.dueOdometer?.unit }}</p>
                </div>
              </div>
            </div>
          </DialogTrigger>

          <!-- Desktop -->
          <div
            v-else
            :class="
              twMerge(
                'group listHover flex w-82 cursor-default gap-4 rounded p-3 md:max-h-full md:w-full',
                (todo.dueDate?.overdue || todo.dueOdometer?.overdue) && !todo.isCompleted && 'bg-destructive/20!',
              )
            "
          >
            <!-- Left section -->
            <Checkbox
              :model-value="todo.isCompleted"
              @click.stop
              @update:model-value="
                toggleTodo({
                  todoId: todo.id,
                  complete: !todo.isCompleted,
                })
              "
              class="group-hover:bg-accent/10 group-hover:border-foreground/50 my-auto size-6 bg-transparent"
              variant="secondary"
            />

            <!-- Right section -->
            <div class="flex w-full flex-col gap-1">
              <!-- title / priority -->
              <div class="flex w-full justify-between gap-4">
                <h3 class="w-fit truncate line-through" :class="todo.isCompleted && 'text-muted-foreground purchased'">
                  {{ todo.title }}
                </h3>

                <Badge v-if="todo.priority" variant="outline" :class="twMerge('priority-' + todo.priority, 'text-xs')">
                  {{ capitalize(todo.priority || "") }}
                </Badge>
              </div>

              <!-- Description -->
              <span
                v-if="todo.description"
                class="text-muted-foreground hidden overflow-hidden text-start text-sm md:block"
                :class="todo.isCompleted && 'purchased'"
              >
                {{ todo.description }}
              </span>

              <!-- Overdue -->
              <div class="mt-auto flex items-center gap-2 text-sm">
                <p class="text-end">
                  <span class="text-muted-foreground mr-2">Due</span>
                  <span v-if="todo.dueDate?.date" :class="twMerge(todo.dueDate?.overdue && 'text-destructive')">{{
                    useTimeAgoIntl(new Date(todo.dueDate.date))
                  }}</span>
                </p>
                <p v-if="todo.dueOdometer">/ {{ todo.dueOdometer?.remaining }} {{ todo.dueOdometer?.unit }}</p>
              </div>
            </div>
          </div>
          <DialogContent>
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

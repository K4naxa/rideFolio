<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";

import Label from "@/components/ui/label/Label.vue";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import type { BaseTodo } from "@repo/validation";

import { twMerge } from "tailwind-merge";
import { useModalStore } from "@/stores/modal.ts";
import { useVehicles } from "@/lib/composables/useVehicles.ts";
import { useTimeAgo } from "@vueuse/core";
import Icon from "@/components/icons/Icon.vue";

interface TodoTableProps {
  todos: BaseTodo[];
  showVehicleNames?: boolean;
}
const props = defineProps<TodoTableProps>();

const { mutate: toggleTodo } = useTodoToggle();
const modalStore = useModalStore();

const { getVehicleNameById } = useVehicles();

function isOverdue(todo: BaseTodo) {
  return (todo.dueDate?.overdue || todo.dueOdometer?.overdue) && !todo.isCompleted;
}

function hasDueInfo(todo: BaseTodo) {
  return todo.dueDate?.date || todo.dueOdometer?.value;
}
</script>
<template>
  <div class="scrollbar-thin h-full min-h-0 w-full min-w-0 flex-1 overflow-auto" key="scrollArea">
    <!-- Table Body -->
    <ul class="gaps-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="todo in props.todos"
        :key="todo.id"
        class="card p-4"
        :class="
          twMerge(
            'card group cardHover hover:bg-accent/20 relative flex flex-col gap-2 p-2',
            isOverdue(todo) && 'border-l-destructive border-l-3',
          )
        "
      >
        <!--        Completed Checkbox -->
        <Checkbox
          :model-value="todo.isCompleted"
          @update:model-value="
            toggleTodo({
              todoId: todo.id,
              complete: !todo.isCompleted,
            })
          "
          class="group-hover:border-primary absolute top-4 right-4 size-6"
        />

        <div v-if="showVehicleNames" class="flex gap-2">
          <Badge v-if="showVehicleNames" variant="accent" class="h-fit">
            {{ getVehicleNameById(todo.vehicleId) }}
          </Badge>
        </div>

        <Label
          :class="{ 'text-muted-foreground line-through': todo.isCompleted }"
          class="text-base hover:cursor-pointer"
          @click="modalStore.onOpen('createTodo', todo.id)"
        >
          {{ todo.title }}
        </Label>

        <span v-if="todo.description" class="text-muted-foreground text-sm">
          {{ todo.description }}
        </span>

        <!--        Footer-->
        <div v-if="hasDueInfo(todo)" class="mt-auto flex items-center gap-2 text-xs [&_svg]:size-4">
          <Label class="text-muted-foreground text-xs">Due: </Label>

          <Badge v-if="todo.dueDate" :variant="todo.dueDate.overdue ? 'destructive' : 'muted'">
            <Icon name="calendar" /> {{ useTimeAgo(new Date(todo.dueDate.date)) }}
          </Badge>

          <Badge v-if="todo.dueOdometer" :variant="todo.dueOdometer.overdue ? 'destructive' : 'muted'">
            <Icon name="odoDistance" />
            {{
              todo.dueOdometer.overdue
                ? todo.dueOdometer.remaining + " " + todo.dueOdometer.unit + " " + "ago"
                : "in" + " " + todo.dueOdometer.remaining + " " + todo.dueOdometer.unit
            }}
          </Badge>
        </div>
      </li>
    </ul>
  </div>
</template>

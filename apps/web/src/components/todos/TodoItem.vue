<script setup lang="ts">
import type { BaseTodo } from "@repo/validation";
import { computed } from "vue";
import { twMerge } from "tailwind-merge";
import { useTimeAgo } from "@vueuse/core";
import Badge from "../ui/badge/Badge.vue";
import Checkbox from "../ui/checkbox/Checkbox.vue";
import { Label } from "@/components/ui/label";
import Icon from "@/components/icons/Icon.vue";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations.ts";
import { useVehicles } from "@/lib/composables/useVehicles.ts";

const props = defineProps<{
  todo: BaseTodo;
  showVehicle?: boolean;
  minimized?: boolean;
}>();

const { mutate: toggleTodo } = useTodoToggle();

const { getVehicleNameById } = useVehicles();

const isOverdue = computed(
  () => (props.todo.dueOdometer?.overdue || props.todo.dueDate?.overdue) && !props.todo.isCompleted,
);
const hasDueInfo = computed(() => props.todo.dueDate?.date || props.todo.dueOdometer?.value);

const dueDateAgo = computed(() => (props.todo.dueDate?.date ? useTimeAgo(new Date(props.todo.dueDate.date)) : null));

const odometerText = computed(() => {
  if (!props.todo.dueOdometer) return "";
  const { overdue, remaining, unit } = props.todo.dueOdometer;
  return overdue ? `${remaining} ${unit} ago` : `in ${remaining} ${unit}`;
});
</script>

<template>
  <div
    :class="
      twMerge(
        'card group cardHover cursor-pointer px-3 py-2 transition-colors duration-150 md:max-h-full md:w-full',
        isOverdue && 'border-l-destructive! border-l-3!',
      )
    "
  >
    <div class="flex w-full items-center gap-4">
      <span
        class="w-fit truncate text-sm font-medium line-through"
        :class="todo.isCompleted && 'text-muted-foreground completed'"
      >
        {{ todo.title }}
      </span>

      <div class="ml-auto flex gap-4">
        <Badge
          v-if="props.showVehicle"
          variant="accent"
          class="bg-sidebar-accent text-sidebar-accent-foreground border-border border"
        >
          {{ getVehicleNameById(todo.vehicleId) }}
        </Badge>

        <Checkbox
          :model-value="todo.isCompleted"
          :aria-label="`Mark &quot;${todo.title}&quot; as ${todo.isCompleted ? 'incomplete' : 'complete'}`"
          @click.stop
          @update:model-value="
            toggleTodo({
              todoId: todo.id,
              complete: !todo.isCompleted,
            })
          "
          class="group-hover:border-primary size-6"
          variant="secondary"
        />
      </div>
    </div>

    <span
      v-if="todo.description && !props.minimized"
      class="text-muted-foreground block overflow-hidden text-start text-sm"
    >
      {{ todo.description }}
    </span>

    <div v-if="hasDueInfo" class="mt-2 flex items-center gap-2 text-xs [&_svg]:size-4">
      <Label class="text-muted-foreground text-xs">Due: </Label>

      <Badge
        v-if="todo.dueDate && dueDateAgo"
        :variant="todo.dueDate.overdue && !todo.isCompleted ? 'destructive' : 'muted'"
      >
        <Icon name="calendar" /> {{ dueDateAgo }}
      </Badge>

      <Badge v-if="todo.dueOdometer" :variant="todo.dueOdometer.overdue && !todo.isCompleted ? 'destructive' : 'muted'">
        <Icon name="odoDistance" />
        {{ odometerText }}
      </Badge>
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
  transition: transform 0.15s cubic-bezier(0.25, 0, 0.2, 1);
  transform-origin: left;
}
.line-through.completed::after {
  transform: scaleX(1);
}
</style>

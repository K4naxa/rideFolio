<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useTodoDelete, useTodoToggle } from "@/lib/queries/todos/todo-mutations";

import { useModalStore } from "@/stores/modal";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import type { Todo } from "@repo/validation";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";

const { mutate: toggleTodo } = useTodoToggle();
const { mutate: deleteTodo } = useTodoDelete();
interface TodoTableProps {
  size?: "sm" | "md";
  hideCompleted?: boolean;
  searchQuery?: string;
  todos: Todo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  showVehicle?: boolean;
}
const props = defineProps<TodoTableProps>();
const { onOpen } = useModalStore();

const PRIORITY_CONFIG = {
  CRITICAL: { color: "bg-purple-700 text-white", label: "Critical" },
  HIGH: { color: "bg-orange-700 text-white", label: "High" },
  MEDIUM: { color: "bg-yellow-700 text-white", label: "Medium" },
  LOW: { color: "bg-green-700 text-white", label: "Low" },
} as const;

const getPriorityConfig = (priority: string) => {
  return (
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || {
      color: "bg-gray-500",
      label: priority,
    }
  );
};

// Dynamic grid template columns based on visible columns
const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority, showCompletedInfo } = storeToRefs(settingsStore);
const tableColumns = computed(() => {
  const cols = ["3rem"];

  if (props.showVehicle) cols.push("6rem");
  if (showPriority.value) cols.push("4rem");
  cols.push("1fr");
  if (showDueInfo.value) cols.push("10rem");
  // Completed date column
  if (showCompletedInfo.value) cols.push("7rem");
  cols.push("3rem");
  return cols.join(" ");
});

const filteredTodos = computed(() => {
  if (!props.todos) return [];

  let filtered = [...props.todos];

  // Always apply completed filter based on showCompleted setting
  if (!showCompleted.value || props.hideCompleted) {
    filtered = filtered.filter((todo) => !todo.isCompleted);
  }

  return filtered.sort((a, b) => {
    // Incomplete todos first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return 0;
  });
});

const formatOdometer = (value: number, unit: string) => {
  return `${value.toLocaleString()} ${unit}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
<template>
  <div class="flex min-h-0 w-full flex-col">
    <div
      v-if="!isLoading && filteredTodos.length"
      class="scrollbar-thin h-full min-h-0 w-full min-w-0 flex-1 overflow-auto"
      key="scrollArea"
    >
      <div
        class="text-accent-foreground bg-muted sticky z-10 grid w-fit min-w-full items-center gap-x-3 rounded-t-lg border-b px-2 shadow-sm"
        :class="props.size ? (props.size === 'sm' ? 'h-10' : 'h-12') : 'h-12'"
        :style="{ gridTemplateColumns: tableColumns }"
      >
        <Label class="flex justify-center">State</Label>
        <Label v-if="props.showVehicle">Vehicle</Label>
        <Label v-if="showPriority">Priority</Label>
        <Label class="max-w-96 min-w-60 md:max-w-none">Todo</Label>
        <Label v-if="showDueInfo">Due</Label>
        <Label v-if="showCompletedInfo">Completed</Label>
        <Label></Label>
      </div>

      <!-- Table Body -->
      <ul v-auto-animate class="divide-border divide-y">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="[
            'listHover grid w-fit min-w-full gap-x-3 px-2',
            (todo.dueDate?.overdue || todo.dueOdometer?.overdue) &&
              !todo.isCompleted &&
              'border-l-destructive border-l-2',
            props.size ? (props.size === 'sm' ? 'py-2 text-sm' : 'py-4 text-base') : 'py-4',
          ]"
          :style="{ gridTemplateColumns: tableColumns }"
        >
          <!-- Checkbox -->
          <div class="flex items-center justify-center">
            <Checkbox
              :model-value="todo.isCompleted"
              @update:model-value="
                toggleTodo({
                  todoId: todo.id,
                  complete: !todo.isCompleted,
                })
              "
              class="size-6"
            />
          </div>

          <div v-if="props.showVehicle" class="flex min-h-0 items-center gap-2">
            <VehicleAvatar v-if="todo.vehicleData.image" :src="todo.vehicleData.image" :type="todo.vehicleData.type" />
            <div v-else class="bg-muted grid h-full flex-1 place-content-center rounded border">
              <Label class="text-muted-foreground">{{ todo.vehicleData.name }}</Label>
            </div>
          </div>

          <!-- Priority Badge -->
          <div v-if="showPriority" class="flex items-center justify-center">
            <Badge
              variant="outline"
              v-if="todo.priority"
              :class="['lowercase', getPriorityConfig(todo.priority).color]"
            >
              {{ getPriorityConfig(todo.priority).label }}
            </Badge>
          </div>

          <!-- Todo Content -->
          <div class="flex min-w-60 flex-col justify-center gap-1">
            <span :class="{ 'text-muted-foreground line-through': todo.isCompleted }">
              {{ todo.title }}
            </span>
            <span v-if="todo.description" class="text-muted-foreground text-sm">
              {{ todo.description }}
            </span>
          </div>

          <!-- Due Info -->
          <div v-if="showDueInfo" class="flex flex-col justify-center gap-1 text-sm">
            <div
              v-if="todo.dueOdometer"
              :class="{ 'text-destructive font-medium': todo.dueOdometer.overdue && !todo.isCompleted }"
            >
              {{ formatOdometer(todo.dueOdometer.value, todo.dueOdometer.unit) }}
            </div>
            <div
              v-if="todo.dueDate"
              :class="{ 'text-destructive font-medium': todo.dueDate.overdue && !todo.isCompleted }"
            >
              {{ formatDate(String(todo.dueDate.date)) }}
            </div>
          </div>
          <div v-if="showCompletedInfo" class="text-muted-foreground flex flex-col justify-center gap-1 text-sm">
            <p v-if="todo.completedData">{{ formatDate(String(todo.completedData?.date)) }}</p>
            <p v-if="todo.completedData">
              {{ formatOdometer(todo.completedData?.odometer.value, todo.completedData?.odometer.unit) }}
            </p>
          </div>

          <!-- Actions (placeholder) -->
          <div class="flex items-center justify-center">
            <DropdownMenu :modal="false">
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"> <Icon name="dotsHorizontal" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="onOpen('createTodo', todo.id)"> Edit </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  @click="deleteTodo({ todoId: todo.id, vehicleId: todo.vehicleData.id })"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ul>
    </div>

    <div v-else class="grid flex-1 place-content-center">
      <p v-if="isLoading" class="text-muted-foreground"><Spinner /> Loading</p>
      <p v-else-if="isError" class="text-destructive">Error loading todos.</p>
      <Empty v-else-if="searchQuery">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> No todos found </EmptyTitle>
          <EmptyDescription> No todos match your search query. Try adjusting your search or filters. </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Empty v-else-if="!todos?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no todos</EmptyTitle>
          <EmptyDescription> Create new todos to get started! </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="onOpen('createTodo')"> Create To-do </Button>
        </EmptyContent>
      </Empty>

      <Empty v-else-if="!showCompleted || hideCompleted">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> All todos Completed </EmptyTitle>
          <EmptyDescription>
            You have not pending todos to show here. Create new todos to get started!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="onOpen('createTodo')"> Create To-do </Button>
        </EmptyContent>
      </Empty>
    </div>
  </div>
</template>

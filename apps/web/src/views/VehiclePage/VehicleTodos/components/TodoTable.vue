<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const { activeVehicleId } = useActiveVehicle();
const { vehicleTodos, toggleTodo, deleteTodo, vehicleTodosLoading, vehicleTodosError } =
  useTodoQueries(activeVehicleId);

interface TodoTableProps {
  searchQuery?: string;
  size?: "sm" | "md";
  hideCompleted?: boolean;
}
const props = defineProps<TodoTableProps>();

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
const { showCompleted, showDueInfo, showPriority } = storeToRefs(settingsStore);
const tableColumns = computed(() => {
  const cols = ["3rem"];
  if (showPriority.value) cols.push("4rem");
  cols.push("1fr");
  if (showDueInfo.value) cols.push("10rem");
  cols.push("3rem");
  return cols.join(" ");
});

const filteredTodos = computed(() => {
  if (!vehicleTodos.value) return [];

  let filtered = vehicleTodos.value;

  // Apply search filter if query exists
  const query = props.searchQuery?.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(
      (todo) => todo.title.toLowerCase().includes(query) || todo.description?.toLowerCase().includes(query),
    );
  }

  // Always apply completed filter based on showCompleted setting
  if (!showCompleted.value || props.hideCompleted) {
    filtered = filtered.filter((todo) => !todo.isCompleted);
  }

  return filtered;
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
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <ScrollArea v-if="!vehicleTodosLoading && filteredTodos.length" class="h-full min-h-0 flex-1" key="scrollArea">
      <div
        class="text-accent-foreground bg-muted sticky top-0 left-0 z-10 grid items-center gap-x-3 rounded-t border-b px-2 shadow-sm"
        :class="props.size ? (props.size === 'sm' ? 'h-10' : 'h-12') : 'h-12'"
        :style="{ gridTemplateColumns: tableColumns }"
      >
        <Label class="flex justify-center">State</Label>
        <Label v-if="showPriority">Priority</Label>
        <Label class="max-w-96 min-w-60 md:max-w-none">Todo</Label>
        <Label v-if="showDueInfo">Due</Label>
        <Label></Label>
      </div>

      <!-- Table Body -->
      <ul v-auto-animate class="divide-border divide-y">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="[
            'listHover grid gap-x-3 px-2',
            (todo.dueDate?.overdue || todo.dueOdometer?.overdue) && 'border-l-destructive border-l-2',
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
                  vehicleId: todo.vehicleData.id,
                  complete: !todo.isCompleted,
                })
              "
              class="size-6"
            />
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
            <div v-if="todo.dueOdometer" :class="{ 'text-destructive font-medium': todo.dueOdometer.overdue }">
              {{ formatOdometer(todo.dueOdometer.value, todo.dueOdometer.unit) }}
            </div>
            <div v-if="todo.dueDate" :class="{ 'text-destructive font-medium': todo.dueDate.overdue }">
              {{ formatDate(String(todo.dueDate.date)) }}
            </div>
          </div>

          <!-- Actions (placeholder) -->
          <div class="flex items-center justify-center">
            <DropdownMenu :modal="false">
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"> <Icon name="dotsHorizontal" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem> Edit </DropdownMenuItem>
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
      <ScrollBar orientation="vertical" />
    </ScrollArea>

    <div v-else class="grid flex-1 place-content-center">
      <p v-if="vehicleTodosLoading" class="text-muted-foreground"><Spinner /> Loading</p>
      <p v-else-if="vehicleTodosError" class="text-destructive">Error loading todos.</p>
      <p v-else-if="searchQuery" class="text-muted-foreground">No todos found matching your search</p>
      <p v-else-if="!showCompleted || hideCompleted" class="text-muted-foreground">
        All todos Completed
        <br />
        Create new todos to see them here!
      </p>
      <p v-else class="text-muted-foreground">No todos yet. Create one to get started!</p>
    </div>
  </div>
</template>
<style scoped></style>

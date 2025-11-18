<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { Icons } from "@/components/utility/icons";
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { useModalStore } from "@/stores/modal";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import { storeToRefs } from "pinia";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";

const { activeVehicleId } = useActiveVehicle();
const { vehicleTodos, toggleTodo, deleteTodo, vehicleTodosLoading } =
  useTodoQueries(activeVehicleId);
const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority } = storeToRefs(settingsStore);
const { onOpen } = useModalStore();

const searchQuery = ref("");

const PRIORITY_CONFIG = {
  CRITICAL: { color: "bg-purple-700 text-white", label: "Critical" },
  HIGH: { color: "bg-orange-700 text-white", label: "High" },
  MEDIUM: { color: "bg-yellow-700 text-white", label: "Medium" },
  LOW: { color: "bg-green-700 text-white", label: "Low" },
} as const;

const filteredTodos = computed(() => {
  if (!vehicleTodos.value) return [];

  let filtered = vehicleTodos.value;

  // Apply search filter if query exists
  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) || todo.description?.toLowerCase().includes(query),
    );
  }

  // Always apply completed filter based on showCompleted setting
  if (!showCompleted.value) {
    filtered = filtered.filter((todo) => !todo.isCompleted);
  }

  return filtered;
});

const getPriorityConfig = (priority: string) => {
  return (
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || {
      color: "bg-gray-500",
      label: priority,
    }
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatOdometer = (value: number, unit: string) => {
  return `${value.toLocaleString()} ${unit}`;
};

// Dynamic grid template columns based on visible columns
const tableColumns = computed(() => {
  const cols = ["3rem"];
  if (showPriority.value) cols.push("4rem");
  cols.push("1fr");
  if (showDueInfo.value) cols.push("10rem");
  cols.push("3rem");
  return cols.join(" ");
});
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="flex flex-col sm:flex-row justify-between content-center mb-6 gap-3">
      <Input
        v-model="searchQuery"
        type="text"
        name="search"
        id="VehicleTodoSearch"
        placeholder="Search todos..."
        class="w-full sm:min-w-72 sm:max-w-md"
      />
      <div class="flex gap-4 justify-evenly content-center">
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="flex-1">
              <Icons.filter /> <span class="md:hidden">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-52">
            <DropdownMenuCheckboxItem v-model:model-value="showPriority">
              Show priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model:model-value="showDueInfo">
              Show due info
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model:model-value="showCompleted">
              Show completed
              <Badge variant="outline" class="ml-2">{{
                vehicleTodos?.filter((todo) => todo.isCompleted).length
              }}</Badge>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" class="flex-1 sm:w-auto" @click="onOpen('createTodo')">
          <Icons.plus className="stroke-white" />
          Create To-do
        </Button>
      </div>
    </header>

    <!-- Desktop Table View -->
    <ScrollArea v-if="filteredTodos.length > 0" class="border rounded">
      <!-- Table Header -->
      <div
        class="grid items-center flex-1 min-w-max gap-x-3 h-14 px-2 border-b text-sm text-accent-foreground font-medium bg-accent/50"
        :style="{ gridTemplateColumns: tableColumns }"
      >
        <Label class="flex justify-center">State</Label>
        <Label v-if="showPriority">Priority</Label>
        <Label class="min-w-60 max-w-96 md:max-w-none">Todo</Label>
        <Label v-if="showDueInfo">Due</Label>
        <Label></Label>
      </div>

      <!-- Table Body -->
      <ul
        v-if="!vehicleTodosLoading"
        v-auto-animate
        class="divide-y divide-border min-w-max flex-1 overflow-hidden"
      >
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="[
            'grid gap-x-3 py-4 px-2 hover:bg-accent/30 transition-colors duration-150',
            (todo.dueDate?.overdue || todo.dueOdometer?.overdue) &&
              'border-l-2 border-l-destructive',
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
          <div class="flex flex-col justify-center gap-1 min-w-60">
            <span :class="{ 'line-through text-muted-foreground': todo.isCompleted }">
              {{ todo.title }}
            </span>
            <span v-if="todo.description" class="text-sm text-muted-foreground">
              {{ todo.description }}
            </span>
          </div>

          <!-- Due Info -->
          <div v-if="showDueInfo" class="flex flex-col gap-1 justify-center text-sm">
            <div
              v-if="todo.dueOdometer"
              :class="{ 'text-destructive font-medium': todo.dueOdometer.overdue }"
            >
              {{ formatOdometer(todo.dueOdometer.value, todo.dueOdometer.unit) }}
            </div>
            <div
              v-if="todo.dueDate"
              :class="{ 'text-destructive font-medium': todo.dueDate.overdue }"
            >
              {{ formatDate(String(todo.dueDate.date)) }}
            </div>
          </div>

          <!-- Actions (placeholder) -->
          <div class="flex items-center justify-center">
            <DropdownMenu :modal="false">
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"> <Icons.dotsHorizontal /></Button>
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

      <ScrollBar orientation="horizontal" />
    </ScrollArea>

    <!-- Empty State -->
    <div
      v-if="!filteredTodos.length && !vehicleTodosLoading"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <p class="text-muted-foreground">
        {{
          searchQuery
            ? "No todos found matching your search"
            : "No todos yet. Create one to get started!"
        }}
      </p>
    </div>
  </div>
</template>

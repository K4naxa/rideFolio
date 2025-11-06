<script setup lang="ts">
import { computed, ref } from "vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { Icons } from "@/components/utility/icons";
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { CheckCircle } from "lucide-vue-next";
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

const { activeVehicleId } = useActiveVehicle();
const { vehicleTodos, toggleTodo, deleteTodo } = useTodoQueries(activeVehicleId);
const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority } = storeToRefs(settingsStore);
const { onOpen } = useModalStore();

const searchQuery = ref("");

// Priority configuration
const PRIORITY_CONFIG = {
  CRITICAL: { color: "bg-purple-700 text-white", label: "Critical" },
  HIGH: { color: "bg-orange-700 text-white", label: "High" },
  MEDIUM: { color: "bg-yellow-700 text-white", label: "Medium" },
  LOW: { color: "bg-green-700 text-white", label: "Low" },
} as const;

// Computed filtered and sorted todos for better performance
const filteredTodos = computed(() => {
  if (!vehicleTodos.value) return [];

  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return vehicleTodos.value;

  return vehicleTodos.value.filter(
    (todo) =>
      todo.title.toLowerCase().includes(query) || todo.description?.toLowerCase().includes(query),
  );
});

// // Helper to get priority config
const getPriorityConfig = (priority: string) => {
  return (
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || {
      color: "bg-gray-500",
      label: priority,
    }
  );
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper to format odometer
const formatOdometer = (value: number, unit: string) => {
  return `${value.toLocaleString()} ${unit}`;
};

const tableColumns = computed(() => {
  const cols = ["3rem"];
  if (showPriority.value) cols.push("4rem");
  cols.push("1fr");
  if (showDueInfo.value) cols.push("10rem");
  cols.push("3rem");
  return cols.join(" "); // Use space, not underscore
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header - Improved mobile layout -->
    <header class="flex flex-col sm:flex-row justify-between content-center mb-4 gap-3">
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
          <DropdownMenuContent class="w-40">
            <DropdownMenuCheckboxItem v-model:model-value="showPriority">
              Show priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model:model-value="showDueInfo">
              Show due info
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model:model-value="showCompleted">
              Show completed
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
    <div class="border rounded-lg overflow-hidden">
      <div class="overflow-x-auto scrollbar">
        <!-- Table Header -->
        <div
          class="grid items-center gap-x-3 py-3 px-2 border-b text-sm text-accent-foreground font-medium bg-accent/50"
          :style="{ gridTemplateColumns: tableColumns }"
        >
          <Label class="flex justify-center">State</Label>
          <Label v-if="showPriority">Priority</Label>
          <Label class="min-w-60">Todo</Label>
          <Label v-if="showDueInfo">Due</Label>
          <span></span>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-border">
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
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!filteredTodos.length"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <CheckCircle class="size-12 text-muted-foreground mb-3" />
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

<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Input from "@/components/ui/input/Input.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useTodosAll } from "@/lib/queries/todos/todo-queries";
import { useModalStore } from "@/stores/modal";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import TodoTable from "@/views/VehiclePage/VehicleTodos/components/TodoTable.vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const searchQuery = ref("");

const { data: Todos, isLoading, isError } = useTodosAll();
const filteredTodos = computed(() => {
  if (!searchQuery.value) return Todos.value;
  return Todos.value?.filter(
    (todo) =>
      todo.title.toLowerCase().includes(searchQuery.value!.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.value!.toLowerCase()) ||
      todo.vehicle.make?.toLowerCase().includes(searchQuery.value!.toLowerCase()) ||
      todo.vehicle.model?.toLowerCase().includes(searchQuery.value!.toLowerCase()) ||
      todo.vehicle.name?.toLowerCase().includes(searchQuery.value!.toLowerCase()),
  );
});
const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority, showCompletedInfo } = storeToRefs(settingsStore);
const { onOpen } = useModalStore();
</script>
<template>
  <MainContentWrapper>
    <div class="flex h-full w-full flex-col py-4 lg:py-8">
      <header class="mb-6 flex flex-col content-center justify-between gap-3 sm:flex-row">
        <Input
          v-model="searchQuery"
          type="text"
          name="search"
          id="VehicleTodoSearch"
          placeholder="Search todos..."
          class="w-full sm:max-w-md sm:min-w-72"
        />
        <div class="flex content-center justify-evenly gap-4">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="flex-1">
                <Icon name="filter" /> <span class="md:hidden">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-52">
              <DropdownMenuCheckboxItem v-model:model-value="showPriority"> Show priority </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:model-value="showDueInfo"> Show due info </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:model-value="showCompletedInfo">
                Show completed info
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem v-model:model-value="showCompleted"> Show completed </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" class="flex-1 sm:w-auto" @click="onOpen('createTodo')">
            <Icon name="plus" className="stroke-white" />
            Create To-do
          </Button>
        </div>
      </header>
      <div class="flex w-full rounded border">
        <TodoTable
          :todos="filteredTodos"
          :isLoading="isLoading"
          :isError="isError"
          :search-query="searchQuery"
          show-vehicle
        />
      </div>
    </div>
  </MainContentWrapper>
</template>

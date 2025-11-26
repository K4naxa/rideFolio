<script setup lang="ts">
import { ref } from "vue";
import { useModalStore } from "@/stores/modal";
import { useTodoSettingsStore } from "@/stores/todoSettings";
import { storeToRefs } from "pinia";

import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";

import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";

import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";

import Icon from "@/components/icons/Icon.vue";
import TodoTable from "./components/TodoTable.vue";

const settingsStore = useTodoSettingsStore();
const { showCompleted, showDueInfo, showPriority } = storeToRefs(settingsStore);
const { onOpen } = useModalStore();

const searchQuery = ref("");
</script>

<template>
  <div class="flex h-full flex-col">
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
    <div class="flex flex-1 rounded border">
      <TodoTable :search-query="searchQuery" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseTodo } from "@repo/validation";

import TodoItem from "@/components/todos/TodoItem.vue";

interface TodoTableProps {
  todos: BaseTodo[];
  showVehicle?: boolean;
}
const props = defineProps<TodoTableProps>();
</script>
<template>
  <div class="scrollbar-thin h-full min-h-0 w-full min-w-0 flex-1 overflow-auto" key="scrollArea">
    <!-- Table Body -->
    <ul class="gaps-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <todo-item :todo="todo" v-for="todo in props.todos" :key="todo.id" :showVehicle />
    </ul>
  </div>
</template>

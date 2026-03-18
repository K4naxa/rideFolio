<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import TodoDetails from "@/components/todos/TodoDetails.vue";
import { useModalStore } from "@/stores/modal.ts";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries.ts";
import { useTodoById } from "@/lib/queries/todos/todo-queries.ts";
import { computed } from "vue";

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isOpen && modalStore.type === "todoDetails");
const todoId = computed(() => (isOpen.value ? modalStore.itemId : undefined));

function handleOpenChange(value: boolean) {
  if (!value && modalStore.type === "todoDetails") modalStore.onClose();
}

const { data: todo, isLoading } = useTodoById(todoId);

// Vehicle data from cache
const { data: vehicles } = useVehiclesAll();
const vehicle = computed(() => vehicles.value?.find((v) => v.vehicleData.id === todo.value?.vehicleId)?.vehicleData);

// Edit
function handleEdit() {
  if (!todo.value) return;
  modalStore.onOpen("createTodo", todo.value.id);
}
</script>

<template>
  <ResponsiveFormDialog
    :open="isOpen"
    @update:open="handleOpenChange"
    title="To-do Details"
    icon="todo"
    content-class="max-w-xl"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      <span class="text-muted-foreground text-sm">Loading details...</span>
    </div>

    <TodoDetails
      v-else-if="todo"
      :todo="todo"
      variant="full"
      show-vehicle
      :vehicle-image="vehicle?.image"
      :vehicle-type="vehicle?.type.code"
      @close="modalStore.onClose()"
    />

    <template #footer>
      <Button variant="outline" @click="handleEdit">
        <Icon name="edit" />
        Edit
      </Button>
    </template>
  </ResponsiveFormDialog>
</template>

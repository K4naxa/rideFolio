<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import AlertModal from "@/modals/alertModal.vue";
import { useModalStore } from "@/stores/modal.ts";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries.ts";
import { useTodoById } from "@/lib/queries/todos/todo-queries.ts";
import { useTodoDelete } from "@/lib/queries/todos/todo-mutations.ts";
import { computed, ref } from "vue";

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isOpen && modalStore.type === "todoDetails");
const todoId = computed(() => (isOpen.value ? modalStore.itemId : undefined));

function handleOpenChange(value: boolean) {
  if (!value) modalStore.onClose();
}

const { data: todo, isLoading } = useTodoById(todoId);

// Vehicle data from cache
const { data: vehicles } = useVehiclesAll();
const vehicle = computed(() =>
  vehicles.value?.find((v) => v.vehicleData.id === todo.value?.vehicleId)?.vehicleData,
);

const createdDate = computed(() => {
  if (!todo.value?.createdData.date) return "";
  return new Date(todo.value.createdData.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const dueDateFormatted = computed(() => {
  if (!todo.value?.dueDate?.date) return null;
  return new Date(todo.value.dueDate.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Edit
function handleEdit() {
  if (!todo.value) return;
  modalStore.onOpen("createTodo", todo.value.id);
}

// Delete
const showDeleteConfirm = ref(false);
const { mutateAsync: deleteTodo, isPending: isDeleting } = useTodoDelete();

async function handleDelete() {
  if (!todo.value) return;
  await deleteTodo({ todoId: todo.value.id, vehicleId: todo.value.vehicleId });
  modalStore.onClose();
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

    <template v-else-if="todo">
      <!-- Vehicle identity -->
      <div class="flex items-start gap-4">
        <VehicleAvatar
          :src="vehicle?.image"
          :type="vehicle?.type.code"
          class="h-16 w-22 shrink-0 rounded-lg"
        />
        <div class="flex min-w-0 flex-col gap-1">
          <h3 class="truncate text-lg font-medium leading-tight">{{ vehicle?.name }}</h3>
          <div class="flex flex-wrap items-center gap-1.5">
            <Badge v-if="vehicle?.make" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.make }}
            </Badge>
            <Badge v-if="vehicle?.model" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.model }}
            </Badge>
          </div>
          <span class="text-muted-foreground text-xs">{{ createdDate }}</span>
        </div>
      </div>

      <Separator />

      <!-- Title & status -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-if="todo.isCompleted" class="bg-success/10 text-success gap-1 font-medium">
            <Icon name="circleCheck" size="sm" />
            Completed
          </Badge>
          <Badge v-else class="bg-todo/10 text-todo gap-1 font-medium">
            <Icon name="todo" size="sm" />
            Open
          </Badge>
        </div>
        <h3 class="text-foreground text-base font-medium">{{ todo.title }}</h3>
      </div>

      <!-- Description -->
      <template v-if="todo.description">
        <section class="flex flex-col gap-2">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Description</h4>
          <p class="text-foreground text-sm leading-relaxed whitespace-pre-line">{{ todo.description }}</p>
        </section>
      </template>

      <!-- Due information -->
      <template v-if="todo.dueDate || todo.dueOdometer">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Due information</h4>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <div v-if="dueDateFormatted" class="flex flex-col gap-0.5">
              <span class="text-muted-foreground text-xs">Due date</span>
              <span class="text-foreground text-sm font-medium" :class="{ 'text-destructive': todo.dueDate?.overdue }">
                {{ dueDateFormatted }}
                <Badge v-if="todo.dueDate?.overdue" class="bg-destructive/10 text-destructive ml-1 text-xs font-medium">Overdue</Badge>
              </span>
            </div>
            <div v-if="todo.dueOdometer" class="flex flex-col gap-0.5">
              <span class="text-muted-foreground text-xs">Due odometer</span>
              <span class="text-foreground text-sm font-medium" :class="{ 'text-destructive': todo.dueOdometer.overdue }">
                {{ todo.dueOdometer.value.toLocaleString() }} {{ todo.dueOdometer.unit }}
                <Badge v-if="todo.dueOdometer.overdue" class="bg-destructive/10 text-destructive ml-1 text-xs font-medium">Overdue</Badge>
                <span v-else-if="todo.dueOdometer.remaining != null" class="text-muted-foreground ml-1 text-xs font-normal">
                  ({{ todo.dueOdometer.remaining.toLocaleString() }} {{ todo.dueOdometer.unit }} remaining)
                </span>
              </span>
            </div>
          </div>
        </section>
      </template>

      <!-- Completion info -->
      <template v-if="todo.completedData">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Completion</h4>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <div v-if="todo.completedData.date" class="flex flex-col gap-0.5">
              <span class="text-muted-foreground text-xs">Completed on</span>
              <span class="text-foreground text-sm font-medium">
                {{ new Date(todo.completedData.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) }}
              </span>
            </div>
            <div v-if="todo.completedData.odometer" class="flex flex-col gap-0.5">
              <span class="text-muted-foreground text-xs">At odometer</span>
              <span class="text-foreground text-sm font-medium">
                {{ todo.completedData.odometer.value.toLocaleString() }} {{ todo.completedData.odometer.unit }}
              </span>
            </div>
          </div>
          <div v-if="todo.completedData.user" class="flex items-center gap-2">
            <div class="bg-muted flex size-7 items-center justify-center rounded-full">
              <Icon name="user" size="sm" class="text-muted-foreground" />
            </div>
            <span class="text-foreground text-sm font-medium">{{ todo.completedData.user.name }}</span>
          </div>
        </section>
      </template>

      <!-- Created by -->
      <template v-if="todo.createdData.user">
        <Separator />
        <section class="flex flex-col gap-2">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Created by</h4>
          <div class="flex items-center gap-2">
            <div class="bg-muted flex size-7 items-center justify-center rounded-full">
              <Icon name="user" size="sm" class="text-muted-foreground" />
            </div>
            <span class="text-foreground text-sm font-medium">{{ todo.createdData.user.name }}</span>
          </div>
        </section>
      </template>
    </template>

    <!-- Footer actions -->
    <template v-if="todo" #footer>
      <div class="flex w-full items-center gap-2">
        <AlertModal
          title="Delete to-do"
          description="This will permanently delete this to-do. This action cannot be undone."
          action-label="Delete"
          action-variant="destructive"
          v-model:open="showDeleteConfirm"
          @action="handleDelete"
        >
          <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" :disabled="isDeleting">
            <Icon name="trash" size="sm" />
            Delete
          </Button>
        </AlertModal>
        <div class="flex-1" />
        <Button variant="outline" size="sm" @click="handleEdit">
          <Icon name="edit" size="sm" />
          Edit
        </Button>
      </div>
    </template>
  </ResponsiveFormDialog>
</template>

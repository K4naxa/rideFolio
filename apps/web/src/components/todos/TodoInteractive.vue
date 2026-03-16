<script setup lang="ts">
import type { BaseTodo } from "@repo/validation";
import { ref } from "vue";
import { useTodoDelete, useTodoToggle } from "@/lib/queries/todos/todo-mutations.ts";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";
import TodoItem from "@/components/todos/TodoItem.vue";
import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import TodoActivityPreviewItem from "@/components/previews/todo/TodoActivityPreviewItem.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import { Drawer, DrawerHeader, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import Button from "../ui/button/Button.vue";
import Icon from "@/components/icons/Icon.vue";
import { useModalStore } from "@/stores/modal.ts";

const props = defineProps<{
  todo: BaseTodo;
  showVehicle?: boolean;
}>();

const { mutateAsync: toggleTodo } = useTodoToggle();
const { mutateAsync: deleteTodo } = useTodoDelete();

const modalStore = useModalStore();

const isOpen = ref(false);

const isMobile = useIsMobile();

async function handleDelete() {
  await deleteTodo({ todoId: props.todo.id, vehicleId: props.todo.vehicleId });
  isOpen.value = false;
}

function handleEdit() {
  modalStore.onOpen("createTodo", props.todo.id);
  isOpen.value = false;
}
</script>

<template>
  <!--  Desktop Dialog -->
  <Dialog v-if="!isMobile" v-slot="{ close }" v-model:open="isOpen">
    <DialogTrigger as-child>
      <TodoItem :todo :show-vehicle="props.showVehicle" />
    </DialogTrigger>

    <DialogContent class="max-w-xl">
      <TodoActivityPreviewItem :activity="todo" @close="close" />
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger asChild>
      <TodoItem class="min-w-80" :todo :show-vehicle="props.showVehicle" />
    </DrawerTrigger>

    <DrawerContent class="overflow-visible!">
      <!-- Floating item that peeks above the drawer -->
      <template #floatingItem>
        <TodoItem :todo class="" />
      </template>

      <drawer-header class="px-3">
        <Button
          :variant="todo.isCompleted ? 'secondary' : 'default'"
          class="w-full"
          @click="toggleTodo({ todoId: props.todo.id, complete: !props.todo.isCompleted })"
        >
          Mark as {{ props.todo.isCompleted ? "incomplete" : "complete" }}
        </Button>
      </drawer-header>

      <div class="flex flex-col">
        <Button variant="menu" @click="handleEdit"> <Icon name="edit" /> Edit </Button>
        <Button variant="menu" class="text-red-500" @click="handleDelete"> <Icon name="trash" /> Delete </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

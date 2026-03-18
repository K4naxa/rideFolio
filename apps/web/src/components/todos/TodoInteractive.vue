<script setup lang="ts">
import type { BaseTodo } from "@repo/validation";
import { ref } from "vue";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations.ts";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";
import TodoItem from "@/components/todos/TodoItem.vue";
import TodoDetails from "@/components/todos/TodoDetails.vue";
import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import Button from "../ui/button/Button.vue";
import Icon from "@/components/icons/Icon.vue";
import { DialogClose, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/modal.ts";

const props = defineProps<{
  todo: BaseTodo;
  showVehicle?: boolean;
}>();

const { mutateAsync: toggleTodo } = useTodoToggle();

const modalStore = useModalStore();
function handleEdit() {
  if (!props.todo) return;
  modalStore.onOpen("createTodo", props.todo.id);
  isOpen.value = false;
}

const isOpen = ref(false);
const isMobile = useIsMobile();
</script>

<template>
  <!--  Desktop Dialog -->
  <Dialog v-if="!isMobile" v-slot="{ close }" v-model:open="isOpen">
    <DialogTrigger as-child>
      <TodoItem :todo :show-vehicle="props.showVehicle" />
    </DialogTrigger>

    <DialogContent class="bg-card max-w-md">
      <DialogTitle class="sr-only">
        <DialogTitle>Todo view</DialogTitle>
        <DialogDescription>View todo details</DialogDescription>
      </DialogTitle>
      <DialogClose as-child class="absolute top-4 right-4">
        <Button variant="ghost" size="icon-sm" @click="close">
          <Icon name="close" class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
      <TodoDetails :todo variant="compact" :show-vehicle="props.showVehicle" @close="close" />
      <DialogFooter class="mt-4">
        <Button variant="outline" @click="handleEdit" class="w-fit"> <Icon name="edit" /> Edit </Button>
        <Button
          :variant="todo.isCompleted ? 'secondary' : 'default'"
          class="flex-1"
          @click="toggleTodo({ todoId: props.todo.id, complete: !props.todo.isCompleted })"
        >
          Mark as {{ props.todo.isCompleted ? "incomplete" : "complete" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger asChild>
      <TodoItem class="min-w-80" :todo :show-vehicle="props.showVehicle" />
    </DrawerTrigger>

    <DrawerContent>
      <DrawerHeader class="sr-only">
        <DrawerTitle>Todo view</DrawerTitle> <DrawerDescription>View todo details</DrawerDescription>
      </DrawerHeader>
      <div class="px-3">
        <TodoDetails :todo variant="compact" :show-vehicle="props.showVehicle" />
      </div>

      <DrawerFooter class="mt-4 flex-row">
        <Button variant="outline" @click="handleEdit" class="w-fit"> <Icon name="edit" /> Edit </Button>
        <Button
          :variant="todo.isCompleted ? 'secondary' : 'default'"
          class="flex-1"
          @click="toggleTodo({ todoId: props.todo.id, complete: !props.todo.isCompleted })"
        >
          Mark as {{ props.todo.isCompleted ? "incomplete" : "complete" }}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

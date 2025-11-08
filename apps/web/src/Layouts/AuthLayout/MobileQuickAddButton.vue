<script setup lang="ts">
import { ref } from "vue";
import { Icons } from "@/components/utility/icons";
import { useModalStore } from "@/stores/modal";
import { onClickOutside } from "@vueuse/core";
import type { Component } from "vue";
import type { ModalType } from "@/stores/modal";
import Button from "@/components/ui/button/Button.vue";

interface QuickAddAction {
  id: string;
  icon: Component;
  color: string;
  foreground: string;
  label: string;
  modal: ModalType;
}

const actions: QuickAddAction[] = [
  {
    id: "fuel",
    icon: Icons.refill,
    color: "bg-refill",
    foreground: "text-refill-foreground",
    label: "Fuel Up",
    modal: "createRefill",
  },
  {
    id: "maintenance",
    icon: Icons.maintenance,
    color: "bg-maintenance",
    foreground: "text-maintenance-foreground",
    label: "Maintenance",
    modal: "createMaintenance",
  },
  {
    id: "note",
    icon: Icons.notes,
    color: "bg-notes",
    foreground: "text-notes-foreground",
    label: "Note",
    modal: "createNote",
  },
  {
    id: "todo",
    icon: Icons.todo,
    color: "bg-toDo",
    foreground: "text-toDo-foreground",
    label: "Todo",
    modal: "createTodo",
  },
  {
    id: "vehicle",
    icon: Icons.carFront,
    color: "bg-primary",
    foreground: "text-primary-foreground",
    label: "Add Vehicle",
    modal: "createVehicle",
  },
];

const isOpen = ref(false);
const modalStore = useModalStore();
const containerRef = ref<HTMLElement | null>(null);

onClickOutside(containerRef, () => {
  isOpen.value = false;
});

const handleActionClick = (modal: ModalType) => {
  modalStore.onOpen(modal);
  isOpen.value = false;
};

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div ref="containerRef" class="absolute flex justify-center w-full bottom-0 left-0 h-28">
    <div class="relative w-[calc(100%-2rem)] h-28">
      <Button
        size="icon-lg"
        @click="toggleMenu"
        class="absolute rounded-full bottom-2 left-1/2 -translate-x-1/2"
        ><Icons.plus
      /></Button>

      <Button
        v-if="isOpen"
        class="absolute rounded-full top-0"
        style="left: 0%; transform: translateX(0%)"
        @click="toggleMenu"
      >
        <Icons.refill />
      </Button>
      <Button
        v-if="isOpen"
        class="absolute rounded-full top-0"
        style="left: 25%; transform: translateX(-50%)"
        @click="toggleMenu"
      >
        <Icons.refill />
      </Button>
      <Button
        v-if="isOpen"
        class="absolute rounded-full top-0"
        style="left: 50%; transform: translateX(-50%)"
        @click="toggleMenu"
      >
        <Icons.refill />
      </Button>
      <Button
        v-if="isOpen"
        class="absolute rounded-full top-0"
        style="left: 75%; transform: translateX(-50%)"
        @click="toggleMenu"
      >
        <Icons.refill />
      </Button>
      <Button
        v-if="isOpen"
        class="absolute rounded-full top-0"
        style="left: 100%; transform: translateX(-100%)"
        @click="toggleMenu"
      >
        <Icons.refill />
      </Button>
    </div>
  </div>
</template>

<style scoped></style>

<template>
  <div ref="containerRef" class="relative flex items-center justify-center">
    <!-- Backdrop -->
    <Transition @enter="onBackdropEnter" @leave="onBackdropLeave">
      <div v-if="isOpen" class="" aria-hidden="true" />
    </Transition>

    <!-- Action buttons container -->
    <Motion
      :initial="{ opacity: 0 }"
      :animate="actionContainerAnimation"
      class="absolute bottom-full left-1/2 mb-4 flex gap-3"
      :style="{
        pointerEvents: isOpen ? 'auto' : 'none',
        transform: 'translateX(-50%)',
      }"
    >
      <Motion
        v-for="(action, index) in actions"
        :key="action.id"
        :initial="{ y: 20, opacity: 0, scale: 0.5 }"
        :animate="getChildAnimation(index)"
        :transition="{ delay: isOpen ? index * 0.05 + 0.05 : (actions.length - index - 1) * 0.05 }"
      >
        <button
          :class="
            twMerge(
              'bg-background inline-flex h-14 w-14 items-center justify-center rounded-full border shadow-lg',
              action.class,
            )
          "
          @click="handleActionClick(action.modal)"
        >
          <Icon :name="action.icon" class="size-6 stroke-inherit" />
          <span class="sr-only">{{ action.label }}</span>
        </button>
      </Motion>
    </Motion>

    <!-- Main trigger button -->
    <button
      :class="[
        'relative z-10 mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform duration-300 ease-in-out',
        isOpen ? 'bg-secondary text-destructive-foreground' : 'bg-primary text-primary-foreground',
      ]"
      @click="toggleOpen"
    >
      <Motion :animate="{ rotate: isOpen ? 45 : 0 }">
        <Icon name="plus" class="size-6" />
      </Motion>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Motion } from "motion-v";
import { onClickOutside } from "@vueuse/core";
import { useModalStore, type ModalType } from "@/stores/modal";
import { twMerge } from "tailwind-merge";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";

// Composables
const { onOpen } = useModalStore();

// State
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

// Types
type QuickAddAction = {
  id: string;
  icon: IconProps["name"];
  class: string;
  label: string;
  modal: ModalType;
};

// Actions configuration
const actions: QuickAddAction[] = [
  {
    id: "fuel",
    icon: "refill",
    class: "border-refill stroke-refill",
    label: "Fuel Up",
    modal: "createRefill",
  },
  {
    id: "maintenance",
    icon: "maintenance",
    class: "border-maintenance stroke-maintenance",
    label: "Maintenance",
    modal: "createMaintenance",
  },
  {
    id: "note",
    icon: "notes",
    class: "border-notes stroke-notes",
    label: "Note",
    modal: "createNote",
  },
  {
    id: "todo",
    icon: "todo",
    class: "border-todo stroke-todo",
    label: "Todo",
    modal: "createTodo",
  },
  {
    id: "vehicle",
    icon: "carFront",
    class: "stroke-foreground",
    label: "Add Vehicle",
    modal: "createVehicle",
  },
];

onClickOutside(containerRef, () => {
  isOpen.value = false;
});

// Computed animations
const actionContainerAnimation = computed(() => ({
  opacity: 1,
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getChildAnimation = (index: number) => {
  return isOpen.value ? { y: 0, opacity: 1, scale: 1 } : { y: 20, opacity: 0, scale: 0.5 };
};

// Methods
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const handleActionClick = (modal: ModalType) => {
  onOpen(modal);
  isOpen.value = false;
};

// Transition handlers
const onBackdropEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.opacity = "0";
  requestAnimationFrame(() => {
    element.style.transition = "opacity 0.3s";
    element.style.opacity = "1";
    setTimeout(done, 300);
  });
};

const onBackdropLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.transition = "opacity 0.3s";
  element.style.opacity = "0";
  setTimeout(done, 300);
};
</script>

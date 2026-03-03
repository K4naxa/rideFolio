import { computed } from "vue";
import { useModalStore } from "@/stores/modal";
import type { IconProps } from "@/components/icons/Icon.vue";

export interface ActionOption {
  label: string;
  description: string;
  icon: IconProps["name"];
  onClick: () => void;
  iconBg: string;
  iconColor: string;
  cypressDataAttr: string;
}

export function useActionOptions() {
  const modalStore = useModalStore();

  const actionOptions = computed<ActionOption[]>(() => [
    {
      label: "Refill",
      description: "Log a fuel refill",
      icon: "refill",
      onClick: () => modalStore.onOpen("createRefill"),
      iconBg: "bg-refill",
      iconColor: "text-refill-foreground",
      cypressDataAttr: "create-refill-button",
    },
    {
      label: "Maintenance",
      description: "Log a service",
      icon: "maintenance",
      onClick: () => modalStore.onOpen("createMaintenance"),
      iconBg: "bg-maintenance",
      iconColor: "text-maintenance-foreground",
      cypressDataAttr: "create-maintenance-button",
    },
    {
      label: "Note",
      description: "Add a note",
      icon: "notes",
      onClick: () => modalStore.onOpen("createNote"),
      iconBg: "bg-notes",
      iconColor: "text-notes-foreground",
      cypressDataAttr: "create-note-button",
    },
    {
      label: "Todo",
      description: "Add a task",
      icon: "todo",
      onClick: () => modalStore.onOpen("createTodo"),
      iconBg: "bg-todo",
      iconColor: "text-todo-foreground",
      cypressDataAttr: "create-todo-button",
    },
  ]);

  return { actionOptions };
}

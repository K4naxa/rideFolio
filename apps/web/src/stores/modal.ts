import type { NotificationModalType } from "@repo/validation";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type ModalType =
  | NotificationModalType
  | "createVehicle"
  | "createRefill"
  | "createMaintenance"
  | "createNote"
  | "createTodo"
  | "alert"
  | "pool"
  | "settings"
  | "quicklink";

export const useModalStore = defineStore("modal", () => {
  const type = ref<ModalType | null>(null);
  const data = ref<unknown>(undefined);
  const isOpen = ref(false);

  const isSettingsOpen = ref(false);

  const onOpen = (modaltype: ModalType, modalData?: unknown) => {
    ((type.value = modaltype), (data.value = modalData), (isOpen.value = true));
  };

  watch(isSettingsOpen, (newVal) => {
    console.log("isSettingsOpen changed:", newVal);
    console.log("Update trace: ", console.trace());
  });

  const onClose = () => {
    isOpen.value = false;
    setTimeout(() => {
      type.value = null;
      data.value = undefined;
    }, 200);
  };

  return {
    type,
    isSettingsOpen,
    data,
    isOpen,
    onOpen,
    onClose,
  };
});

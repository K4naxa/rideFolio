import { defineStore } from "pinia";
import { ref } from "vue";

export type ModalType = "createVehicle" | "createRefill" | "createMaintenance" | "createNote" | "createTodo" | "alert";

export const useModalStore = defineStore("modal", () => {
  const type = ref<ModalType | null>(null);
  const data = ref<unknown>(undefined);
  const isOpen = ref(false);

  const onOpen = (modaltype: ModalType, modalData?: unknown) => {
    ((type.value = modaltype), (data.value = modalData), (isOpen.value = true));
  };

  const onClose = () => {
    isOpen.value = false;
    setTimeout(() => {
      type.value = null;
      data.value = undefined;
    }, 500);
  };

  return {
    type,
    data,
    isOpen,
    onOpen,
    onClose,
  };
});

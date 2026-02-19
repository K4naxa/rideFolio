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

export const useModalStore = defineStore("modal", {
  state: () => ({
    type: ref<ModalType | null>(null),
    itemId: ref<string | undefined>(undefined),
    isOpen: ref(false),
  }),

  actions: {
    onOpen(modalType: ModalType, itemId?: string) {
      this.type = modalType;
      this.itemId = itemId;
      this.isOpen = true;
    },
    onClose() {
      this.isOpen = false;
      setTimeout(() => {
        this.type = null;
        this.itemId = undefined;
      }, 200);
    },
  },
});

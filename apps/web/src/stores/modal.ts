import { defineStore } from "pinia";
import { ref } from "vue";

export type ModalType =
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

  getters: {
    isModalOpen(): (type: ModalType) => boolean {
      return (type: ModalType) => this.isOpen && this.type === type;
    },
    getItemId(): string | undefined {
      return this.itemId;
    },
  },

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

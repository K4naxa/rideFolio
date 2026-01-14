import { defineStore } from "pinia";

export const useTodoSettingsStore = defineStore("todoSettings", {
  state: () => ({
    showCompleted: false,
    showPriority: false,
    showDueInfo: false,
    showCompletedInfo: false,
  }),

  actions: {
    toggleCompleted() {
      this.showCompleted = !this.showCompleted;
    },

    togglePriority() {
      this.showPriority = !this.showPriority;
    },

    toggleDueInfo() {
      this.showDueInfo = !this.showDueInfo;
    },
    toggleCompletedInfo() {
      this.showCompletedInfo = !this.showCompletedInfo;
    },
    // Or a more flexible approach:
    setSetting(key: keyof typeof this.$state, value: boolean) {
      this[key] = value;
    },

    resetSettings() {
      this.showCompleted = false;
      this.showPriority = false;
      this.showDueInfo = false;
    },
  },
  persist: true,
});

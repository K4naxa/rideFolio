import { defineStore } from "pinia";

export const useTodoSettingsStore = defineStore("todoSettings", {
  state: () => ({
    showCompleted: false,
    showPriority: false,
    showDueInfo: false,
    showCompletedInfo: false,
  }),

  actions: {
    setSetting(key: keyof typeof this.$state, value: boolean) {
      this[key] = value;
    },

    resetSettings() {
      this.showCompleted = false;
      this.showPriority = false;
      this.showDueInfo = false;
      this.showCompletedInfo = false;
    },
  },
  persist: true,
});

import { defineStore } from "pinia";
import { unref, type MaybeRef } from "vue";

type UI_PREFERENCE_ELEMENTS = "consumptionChart";

interface UIElement {
  id: UI_PREFERENCE_ELEMENTS;
  isVisible: boolean;
}

interface VehicleUIPreferences {
  vehicleId: string;
  elements: UIElement[];
}
export const useUIPreferenceStore = defineStore("uiPreference", {
  state: () => ({
    preferences: [] as VehicleUIPreferences[],
  }),

  getters: {
    // check if element is visible, always default to true if no preference is set
    isElementVisible: (state) => (vehicleId: MaybeRef<string | undefined>, elementId: UI_PREFERENCE_ELEMENTS) => {
      const vehiclePreference = state.preferences.find((pref) => pref.vehicleId === unref(vehicleId));
      if (!vehiclePreference) return true; // Default to visible if no preference is set

      const element = vehiclePreference.elements.find((el) => el.id === elementId);
      return element ? element.isVisible : true; // Default to visible if element preference is not set
    },
  },

  actions: {
    setElementVisibility(vehicleId: MaybeRef<string>, elementId: UI_PREFERENCE_ELEMENTS, isVisible: boolean) {
      // Find or create vehicle preference
      const vehiclePreference = this.preferences.find((pref) => pref.vehicleId === unref(vehicleId));
      if (vehiclePreference) {
        const element = vehiclePreference.elements.find((el) => el.id === elementId);
        if (element) {
          element.isVisible = isVisible;
        } else {
          vehiclePreference.elements.push({ id: elementId, isVisible });
        }
      } else {
        this.preferences.push({
          vehicleId: unref(vehicleId),
          elements: [{ id: elementId, isVisible }],
        });
      }
    },
  },
  persist: true,
});

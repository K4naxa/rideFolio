import { onUnmounted, watch } from "vue";
import type { Ref } from "vue";

// Shared state to coordinate between multiple modal instances
let globalHistoryState = { hasOpenModal: false };

export function useHistory(open: Ref<boolean | undefined>, onOpenChange: (isOpen: boolean) => void) {
  let backTimeout: ReturnType<typeof setTimeout> | null = null;
  let hasPushedState = false;

  const handlePopState = () => {
    onOpenChange(false);
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      // Cancel any pending history.back() from this or other modals
      if (backTimeout) {
        clearTimeout(backTimeout);
        backTimeout = null;
      }
      history.pushState({ dialog: true }, "");
      hasPushedState = true;
      globalHistoryState.hasOpenModal = true;
      window.addEventListener("popstate", handlePopState);
    } else {
      window.removeEventListener("popstate", handlePopState);
      globalHistoryState.hasOpenModal = false;

      // Delay history.back() to allow new modals to push their state first
      if (hasPushedState && history.state?.dialog) {
        backTimeout = setTimeout(() => {
          // Only call history.back() if no other modal has opened
          if (!globalHistoryState.hasOpenModal && history.state?.dialog) {
            history.back();
          }
          hasPushedState = false;
          backTimeout = null;
        }, 100);
      }
    }
  });

  onUnmounted(() => {
    window.removeEventListener("popstate", handlePopState);
    if (backTimeout) {
      clearTimeout(backTimeout);
      backTimeout = null;
    }
  });
}

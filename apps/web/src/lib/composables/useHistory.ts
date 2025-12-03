import { onUnmounted, watch } from "vue";
import type { Ref } from "vue";

export function useHistory(open: Ref<boolean | undefined>, onOpenChange: (isOpen: boolean) => void) {
  const handlePopState = () => {
    onOpenChange(false);
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      history.pushState({ dialog: true }, "");
      window.addEventListener("popstate", handlePopState);
    } else {
      window.removeEventListener("popstate", handlePopState);
      if (history.state?.dialog) history.back();
    }
  });

  onUnmounted(() => {
    window.removeEventListener("popstate", handlePopState);
  });
}

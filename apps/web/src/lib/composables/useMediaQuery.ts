import { useMediaQuery } from "@vueuse/core";

export function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint}px)`);
}

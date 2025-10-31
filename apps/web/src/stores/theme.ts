import { defineStore } from "pinia";
import { ref } from "vue";

type Theme = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<Theme>((localStorage.getItem("theme") as Theme) || "system");

  const resolvedTheme = ref<"light" | "dark">("light");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const getResolvedTheme = (): "light" | "dark" => {
    if (theme.value === "system") {
      return mediaQuery.matches ? "dark" : "light";
    }
    return theme.value;
  };

  // Apply theme with smooth transition
  const applyTheme = (withTransition = false) => {
    const resolved = getResolvedTheme();
    const root = document.documentElement;

    if (withTransition) {
      // Use View Transitions API if available for ultra-smooth transitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("startViewTransition" in document && (document as any).startViewTransition) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).startViewTransition(() => {
          root.classList.remove("light", "dark");
          root.classList.add(resolved);
          resolvedTheme.value = resolved;
        });
      } else {
        // Fallback to CSS transitions
        root.classList.add("theme-transitioning");

        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          root.classList.remove("light", "dark");
          root.classList.add(resolved);
          resolvedTheme.value = resolved;
        });

        // Remove transition class after animation completes
        setTimeout(() => {
          root.classList.remove("theme-transitioning");
        }, 250);
      }
    } else {
      // No transition on initial load
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
      resolvedTheme.value = resolved;
    }
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme(true); // WITH transition when user changes theme
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme.value === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (theme.value === "system") {
      applyTheme(true); // WITH transition on system change
    }
  };

  const initialize = () => {
    applyTheme(false); // NO transition on initial load
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  };

  const cleanup = () => {
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    initialize,
    cleanup,
  };
});

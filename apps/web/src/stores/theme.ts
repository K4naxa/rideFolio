import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type ThemeType = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<ThemeType>((localStorage.getItem("theme") as ThemeType) || "system");

  const resolvedTheme = ref<"light" | "dark">("light");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const colors = ref({
    background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
    primary: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim(),
    foreground: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
    mutedForeground: getComputedStyle(document.documentElement).getPropertyValue("--color-muted-foreground").trim(),
    muted: getComputedStyle(document.documentElement).getPropertyValue("--color-muted").trim(),
  });
  watch(
    () => resolvedTheme.value,
    () => {
      colors.value = {
        background: getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
        primary: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim(),
        foreground: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
        mutedForeground: getComputedStyle(document.documentElement).getPropertyValue("--color-muted-foreground").trim(),
        muted: getComputedStyle(document.documentElement).getPropertyValue("--color-muted").trim(),
      };
    },
  );

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

  const setTheme = (newTheme: ThemeType) => {
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

    colors,
  };
});

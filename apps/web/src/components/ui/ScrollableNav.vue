<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from "vue";
import Icon from "@/components/icons/Icon.vue";

interface Props {
  scrollAmount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  scrollAmount: 150,
});

const scrollContainer = useTemplateRef("scrollContainer");
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const checkScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;

  // Add small threshold (1px) to handle floating point issues
  canScrollLeft.value = scrollLeft > 1;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1;
};

const scrollTo = (direction: "left" | "right") => {
  if (!scrollContainer.value) return;

  const amount = direction === "left" ? -props.scrollAmount : props.scrollAmount;

  scrollContainer.value.scrollBy({
    left: amount,
    behavior: "smooth",
  });
};

// Debounced resize observer
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  checkScroll();

  // Listen to scroll events
  scrollContainer.value?.addEventListener("scroll", checkScroll, { passive: true });

  // Watch for size changes
  resizeObserver = new ResizeObserver(checkScroll);
  if (scrollContainer.value) {
    resizeObserver.observe(scrollContainer.value);
  }
});

onUnmounted(() => {
  scrollContainer.value?.removeEventListener("scroll", checkScroll);
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="relative">
    <!-- Left fade + chevron -->
    <Transition name="fade">
      <div v-if="canScrollLeft" class="pointer-events-none absolute top-0 left-0 z-10 flex h-full items-center">
        <!-- Gradient fade -->
        <div class="from-background via-background/80 absolute inset-y-0 left-0 w-12 bg-linear-to-r to-transparent" />
        <!-- Chevron button -->
        <Icon name="chevronLeft" class="text-muted-foreground relative z-10 ml-1 size-5" />
      </div>
    </Transition>

    <!-- Scrollable content -->
    <div ref="scrollContainer" class="scrollbar-macos overflow-x-auto scroll-smooth pb-2">
      <slot />
    </div>

    <!-- Right fade + chevron -->
    <Transition name="fade">
      <div
        v-if="canScrollRight"
        class="pointer-events-none absolute top-0 right-0 z-10 flex h-full items-center justify-end"
      >
        <!-- Gradient fade -->
        <div class="from-background via-background/80 absolute inset-y-0 right-0 w-12 bg-linear-to-l to-transparent" />
        <!-- Chevron button -->
        <Icon name="chevronRight" class="text-muted-foreground relative z-10 mr-1 size-5" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-normal::-webkit-scrollbar {
  display: block;
  scrollbar-width: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

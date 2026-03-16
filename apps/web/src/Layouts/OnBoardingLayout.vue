<script setup lang="ts">
import { Car, Settings } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { twMerge } from "tailwind-merge";

const route = useRoute();
const totalSteps = 2;

const step = computed(() => {
  if (route.name === "onboarding-preferences") return 0;
  if (route.name === "onboarding-add-vehicle") return 1;
  return -1;
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div
      :class="
        twMerge(
          'mx-auto w-full space-y-6 overflow-hidden transition-all duration-300',
          step === 0 ? 'max-w-lg' : 'max-w-2xl',
        )
      "
    >
      <!-- Progress Indicator (Desktop) -->
      <div class="mb-8 hidden items-center justify-between px-2 select-none md:flex">
        <div class="group flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300"
            :class="
              step >= 0
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground'
            "
          >
            <Settings class="h-4 w-4" />
          </div>
          <span :class="step >= 0 ? 'text-primary font-medium' : 'text-muted-foreground'">Preferences</span>
        </div>
        <div class="bg-muted-foreground/20 relative mx-4 h-0.5 flex-1 overflow-hidden rounded-full">
          <div
            class="bg-primary absolute inset-y-0 left-0 transition-all duration-500 ease-out"
            :style="{ width: step >= 1 ? '100%' : '0%' }"
          />
        </div>
        <div class="group flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all delay-100 duration-300"
            :class="
              step >= 1
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground'
            "
          >
            <Car class="h-4 w-4" />
          </div>
          <span :class="step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'">Add Vehicle</span>
        </div>
      </div>

      <RouterView />

      <!-- Mobile Step Indicator -->
      <div class="flex justify-center gap-3 md:hidden">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="h-2 rounded-full transition-all duration-300"
          :class="step === i - 1 ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-2'"
        />
      </div>
    </div>
  </div>
</template>

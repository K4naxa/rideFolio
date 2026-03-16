<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import DashboardSection from "./DashboardSection.vue";
</script>

<template>
  <DashboardSection title="Reminders" icon="calendar">
    <div class="card grid h-32 place-items-center rounded border border-dashed text-center">
      <div class="flex flex-col items-center gap-2">
        <Icon name="calendar" class="text-muted-foreground/50 size-6" />
        <div class="space-y-0.5">
          <p class="text-muted-foreground text-sm font-medium">Coming soon</p>
          <p class="text-muted-foreground/70 text-xs">Service reminders and scheduled maintenance will show up here.</p>
        </div>
      </div>
    </div>
  </DashboardSection>
</template>

<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import DashboardSection from "./DashboardSection.vue";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
</script>

<template>
  <DashboardSection title="Reminders" icon="calendar">
    <Empty class="card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="calendar" />
        </EmptyMedia>

        <EmptyTitle>Coming soon</EmptyTitle>
        <EmptyDescription> Service reminders and scheduled maintenance will show up here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </DashboardSection>
</template>

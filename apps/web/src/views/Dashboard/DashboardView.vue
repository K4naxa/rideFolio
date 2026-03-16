<script setup lang="ts">
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";

import DashboardTodos from "./components/DashboardTodos.vue";
import DashboardNotes from "./components/DashboardNotes.vue";
import DashboardShopping from "./components/DashboardShopping.vue";
import DashboardReminders from "./components/DashboardReminders.vue";
import QuickLinkSection from "./components/QuickLinkSection.vue";
</script>

<template>
  <MainContentWrapper class="flex min-w-0 flex-1 flex-col space-y-8 p-4 lg:pt-20">
    <template #mobile-header>
      <MobilePageHeader> <h1>Dashboard</h1> </MobilePageHeader>
    </template>

    <VehicleScrollArea size="lg" />

    <!-- Main 2-col grid -->
    <div class="gaps-lg grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
      <!-- Left column: Todos + Notes -->
      <div class="gaps-lg flex flex-col">
        <DashboardTodos />
        <DashboardNotes />
      </div>

      <!-- Right column: Reminders + Quick Links + Shopping -->
      <div class="gaps-lg flex flex-col">
        <DashboardReminders />
        <QuickLinkSection />
        <DashboardShopping />
      </div>
    </div>
  </MainContentWrapper>
</template>

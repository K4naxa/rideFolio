<script setup lang="ts">
import AppHeader from "@/components/ui/AppHeader.vue";
import AppSidebar from "@/components/ui/AppSidebar.vue";
import SidebarProvider from "@/components/ui/sidebar/SidebarProvider.vue";
import MobileBottomNav from "../VehicleLayout/MobileBottomNav.vue";
</script>
<template>
  <div class="flex flex-col" id="authLayout">
    <SidebarProvider>
      <AppSidebar />

      <main class="mb-24 flex min-w-0 flex-1 flex-col lg:mb-0" id="authMainSection">
        <AppHeader />
        <div class="flex flex-1">
          <RouterView />
        </div>
      </main>
    </SidebarProvider>
  </div>
  <MobileBottomNav />
</template>

<style></style>

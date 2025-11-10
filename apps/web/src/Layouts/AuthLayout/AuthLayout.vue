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

      <main class="flex-1 flex flex-col min-w-0 mb-20 lg:mb-0" id="authMainSection">
        <AppHeader />
        <div class="flex-1 flex">
          <RouterView />
        </div>
      </main>
    </SidebarProvider>
  </div>
  <MobileBottomNav />
</template>

<style></style>

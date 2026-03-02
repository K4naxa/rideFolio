<script setup lang="ts">
import AppSidebar from "@/components/ui/AppSidebar.vue";
import SidebarProvider from "@/components/ui/sidebar/SidebarProvider.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
</script>
<template>
  <div class="flex flex-col" id="authLayout">
    <SidebarProvider>
      <AppSidebar />

      <main class="mb-24 flex min-w-0 flex-1 flex-col md:mb-0" id="authMainSection">
        <div class="flex flex-1 flex-col">
          <RouterView />
        </div>
      </main>
    </SidebarProvider>
  </div>
  <MobileBottomNav />
</template>

<style></style>

<script setup lang="ts">
import AppHeader from "@/components/ui/AppHeader.vue";
import AppSidebar from "@/components/ui/AppSidebar.vue";
import SidebarProvider from "@/components/ui/sidebar/SidebarProvider.vue";
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <SidebarProvider>
      <AppSidebar />

      <main class="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <div class="">
          <RouterView />
        </div>
      </main>
    </SidebarProvider>
  </div>
</template>

<!-- src/views/NotFound.vue -->
<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="flex w-full max-w-3xl flex-col items-center">
      <h1 class="text-muted-foreground text-7xl">404 - Not Found</h1>
      <p class="text-muted-foreground mt-4">The page you are looking for does not exist or has been moved.</p>

      <RouterLink to="/dashboard">
        <Button class="mt-4 w-full">Return to Home</Button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";

import { RouterLink } from "vue-router";
</script>

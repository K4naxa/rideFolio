<script setup lang="ts">
import { RouterView } from "vue-router";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "vue-sonner";
</script>

<template>
  <RouterView />
  <Toaster />
  <VueQueryDevtools />
</template>

<style scoped></style>

<script setup lang="ts">
import { useCurrentPool } from "@/lib/composables/useCurrentPool";

const { currentPool } = useCurrentPool();
</script>

<template>
  <h1>{{ currentPool?.name }}</h1>
</template>

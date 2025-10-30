<script setup lang="ts">
import { RouterView } from "vue-router";
import { configure } from "vee-validate";

configure({
  validateOnInput: false,
  validateOnBlur: true,
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>

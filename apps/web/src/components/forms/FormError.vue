<script setup lang="ts">
defineProps<{
  message: string | null;
}>();
</script>

<template>
  <p
    v-if="message"
    role="alert"
    aria-live="assertive"
    class="text-destructive rounded-md border border-current/20 bg-current/5 px-3 py-2 text-center text-sm"
  >
    {{ message }}
  </p>
</template>
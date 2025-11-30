<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import { authClient } from "@/lib/authClient";
import type { AlertModalData } from "@/modals/alertModal.vue";
import router from "@/router";
import { useModalStore } from "@/stores/modal";

function handleDelete() {
  const modalStore = useModalStore();

  modalStore.onOpen("alert", {
    title: "Delete Account",
    description: "Are you sure you want to delete your account? This action cannot be undone.",
    actionButton: {
      label: "Delete",
      class: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    cancelButton: {
      label: "Cancel",
    },
    onAction: async () => {
      console.log("Deleting vehicle...");
      authClient.deleteUser();
      router.push({ name: "login" });
    },
  } as AlertModalData);
}
</script>

<template>
  <Card class="border-destructive w-full">
    <CardHeader>
      <CardTitle class="text-destructive"> Danger Zone </CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="destructive" @click="handleDelete" class="w-full"> Delete Account Permanently </Button>
    </CardContent>
  </Card>
</template>

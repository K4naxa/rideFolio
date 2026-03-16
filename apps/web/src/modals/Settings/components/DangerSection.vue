<script setup lang="ts">
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import AlertDialog from "@/components/ui/alert-dialog/AlertDialog.vue";
import AlertDialogAction from "@/components/ui/alert-dialog/AlertDialogAction.vue";
import AlertDialogCancel from "@/components/ui/alert-dialog/AlertDialogCancel.vue";
import AlertDialogContent from "@/components/ui/alert-dialog/AlertDialogContent.vue";
import AlertDialogDescription from "@/components/ui/alert-dialog/AlertDialogDescription.vue";
import AlertDialogFooter from "@/components/ui/alert-dialog/AlertDialogFooter.vue";
import AlertDialogTrigger from "@/components/ui/alert-dialog/AlertDialogTrigger.vue";
import Button from "@/components/ui/button/Button.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { authClient } from "@/lib/authClient";
import router from "@/router";
import { useModalStore } from "@/stores/modal";

const modalStore = useModalStore();
async function deleteAccount() {
  authClient.deleteUser(
    {},
    {
      onSuccess: () => {
        modalStore.onClose();
        router.push("/login");
      },
    },
  );
}
</script>

<template>
  <section>
    <header class="mb-4">
      <h3 class="text-destructive">Danger Zone</h3>
      <Separator class="my-2" />
    </header>
    <div>
      <AlertDialog>
        <AlertDialogTrigger aschild>
          <Button variant="destructive" type="button" class="w-full"> Delete Account Permanently </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader> Delete Account </AlertDialogHeader>

          <AlertDialogDescription>
            Are you sure you want to delete your account? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel> Cancel </AlertDialogCancel>
            <AlertDialogAction
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              @click="deleteAccount"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </section>
</template>

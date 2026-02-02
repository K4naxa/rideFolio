<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { authClient } from "@/lib/authClient";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { queryKeys } from "@/lib/queries/queryKeys";
import { nameSchema } from "@repo/validation";
import { useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { Form } from "vee-validate";
import { ref } from "vue";
import { toast } from "vue-sonner";

const user = useCurrentUser();
const queryClient = useQueryClient();
const showUsernameChangeDialog = ref(false);

const isUsernameChanging = ref(false);
const usernameFormRef = ref<InstanceType<typeof Form> | null>(null);
async function onUsernameChangeSubmit(values: any) {
  console.log("Submitting username change with values:", values);
  isUsernameChanging.value = true;

  try {
    authClient.updateUser(
      {
        ...values,
      },
      {
        onError: (error) => {
          console.error("Error changing username:", error);
          toast.error("Failed to change username. Please try again.");
        },
        onSuccess: () => {
          toast.success("Username updated successfully.");
          queryClient.invalidateQueries({ queryKey: queryKeys.user.basicProfile });
          showUsernameChangeDialog.value = false;
        },
      },
    );
  } finally {
    isUsernameChanging.value = false;
  }
}
</script>

<template>
  <section class="space-y-6 lg:space-y-8">
    <header class="mb-4">
      <h3>Account</h3>
      <Separator class="my-2" />
    </header>

    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col">
        <Label>Avatar</Label>
        <span class="text-muted-foreground text-sm"> Your avatar is visible to other users. </span>
      </div>

      <Button class="mt-2" variant="outline" disabled type="button">Change Avatar (Coming soon)</Button>
    </div>

    <div class="flex items-center justify-between gap-4">
      <div>
        <Label class="">Username</Label>
        <span class="text-muted-foreground text-sm">{{ user?.currentUser.value?.name }}</span>
      </div>
      <Button class="mt-2" variant="outline" @click="showUsernameChangeDialog = true" type="button">
        Change Username
      </Button>
    </div>

    <!-- Username dialog -->
    <ResponsiveFormDialog
      :open="showUsernameChangeDialog"
      @update:open="(val) => (showUsernameChangeDialog = val)"
      title="Change Username"
      description="Update your account username."
    >
      <template #default>
        <Form
          name="UsernameChange"
          ref="usernameFormRef"
          :validation-schema="toTypedSchema(nameSchema)"
          :initial-values="{
            name: '',
          }"
          @submit="onUsernameChangeSubmit"
          class="flex flex-col gap-4"
        >
          <Input
            type="text"
            name="name"
            :placeholder="user?.currentUser.value?.name || 'Username'"
            autocomplete="username"
          />
        </Form>
      </template>
      <template #footer>
        <Button variant="outline" type="button" @click="showUsernameChangeDialog = false"> Cancel </Button>
        <Button type="button" @click="usernameFormRef?.$el.requestSubmit()" :disabled="isUsernameChanging">
          <span v-if="isUsernameChanging" class="flex items-center gap-2"> <Spinner /> Updating </span>
          <span v-else>Update Username</span>
        </Button>
      </template>
    </ResponsiveFormDialog>
  </section>
</template>

<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { authClient } from "@/lib/authClient";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { passwordUpdateSchema } from "@repo/validation";
import { Field, Form } from "vee-validate";
import { ref } from "vue";
import { toast } from "vue-sonner";
import z from "zod";
import FormInput from "@/components/forms/FormInput.vue";

const user = useCurrentUser();
const redirectUrl = import.meta.env.VITE_FRONTEND_URL + "/dashboard";

const showPasswordChangeDialog = ref(false);
const showEmailChangeDialog = ref(false);

const isPasswordChanging = ref(false);
const passwordFormRef = ref<InstanceType<typeof Form> | null>(null);

const isEmailChanging = ref(false);
const emailFormRef = ref<InstanceType<typeof Form> | null>(null);

async function onPasswordChangeSubmit(values: any) {
  console.log("Submitting password change with values:", values);
  isPasswordChanging.value = true;

  try {
    const { data, error } = await authClient.changePassword(
      { ...values },
      {
        onError: (error) => {
          if (error && error.error?.code === "INVALID_PASSWORD") {
            passwordFormRef.value?.setFieldError("currentPassword", "Incorrect password");
          } else {
            console.error("Error changing password:", error);
            toast.error("Failed to change password. Please try again.");
          }
        },
        onSuccess: () => {
          toast.success("Password updated successfully.");
          showPasswordChangeDialog.value = false;
          passwordFormRef.value?.resetForm();
        },
      },
    );
    console.log("Password change response:", { data, error });
  } finally {
    isPasswordChanging.value = false;
  }
}

const emailSchema = z.object({
  newEmail: z.email("Invalid email address"),
});

async function onEmailChangeSubmit(values: any) {
  await authClient.changeEmail(
    { ...values, callbackURL: redirectUrl },

    {
      onError: (error) => {
        console.error("Error changing email:", error);
        toast.error("Failed to change email. Please try again.");
      },
      onSuccess: () => {
        toast.success("Confirmation email sent to your new address.");
        showEmailChangeDialog.value = false;
      },
      onResponse: (res) => {
        console.log("Email change request completed." + JSON.stringify(res));
      },
    },
  );
}
</script>

<template>
  <section class="space-y-6 lg:space-y-8">
    <header class="mb-4">
      <h3>Account Security</h3>
      <Separator class="my-2" />
    </header>

    <div class="flex justify-between gap-4">
      <div>
        <Label>Email</Label>
        <span class="text-muted-foreground text-sm">
          {{ user?.currentUser?.value?.email }}
        </span>
      </div>
      <Button variant="outline" @click="showEmailChangeDialog = true" type="button">Change Email</Button>
    </div>

    <div class="flex justify-between gap-4">
      <div>
        <Label>Password</Label>
        <span class="text-muted-foreground text-sm"> Change your password to login to your account </span>
      </div>
      <Button variant="outline" @click="showPasswordChangeDialog = true" type="button">Change Password</Button>
    </div>

    <!-- Email dialog -->
    <ResponsiveFormDialog
      :open="showEmailChangeDialog"
      @update:open="(val) => (showEmailChangeDialog = val)"
      title="Change Email"
      description="We'll send a confirmation email to the email address you provide to confirm that it's really you"
    >
      <template #trigger> </template>

      <template #default>
        <Form
          name="emailChange"
          ref="emailFormRef"
          :validation-schema="emailSchema"
          :initial-values="{ newEmail: '' }"
          @submit="onEmailChangeSubmit"
          class="flex flex-col gap-4"
        >
          <FormInput name="newEmail" type="email" placeholder="New email address" />
        </Form>
      </template>

      <template #footer>
        <Button variant="outline" type="button" @click="showEmailChangeDialog = false"> Cancel </Button>
        <Button @click="emailFormRef?.$el.requestSubmit()" type="button" :disabled="isEmailChanging">
          Update Email
        </Button>
      </template>
    </ResponsiveFormDialog>

    <!-- Password dialog -->
    <ResponsiveFormDialog
      :open="showPasswordChangeDialog"
      @update:open="(val) => (showPasswordChangeDialog = val)"
      title="Change Password"
      description="Update your account password. Make sure it's strong and secure."
    >
      <template #default>
        <Form
          name="PasswordChange"
          ref="passwordFormRef"
          :validation-schema="passwordUpdateSchema"
          :initial-values="{
            currentPassword: '',
            newPassword: '',
            newPasswordConfirmation: '',
            revokeOtherSessions: true,
          }"
          @submit="onPasswordChangeSubmit"
          class="flex flex-col gap-4"
        >
          <FormInput
            type="password"
            name="currentPassword"
            placeholder="Current password"
            autocomplete="current-password"
          />

          <FormInput type="password" name="newPassword" placeholder="New password" autocomplete="new-password" />
          <FormInput type="password" name="newPasswordConfirmation" placeholder="new password" autoco />
          <Field v-slot="{ value, handleChange }" name="revokeOtherSessions">
            <Label class="flex items-center gap-2">
              <Checkbox class="size-5" :model-value="value" @update:model-value="handleChange" />
              <p class="font-semibold">Log out other sessions</p>
            </Label>
          </Field>
        </Form>
      </template>
      <template #footer>
        <Button variant="outline" type="button" @click="showPasswordChangeDialog = false"> Cancel </Button>
        <Button type="button" @click="passwordFormRef?.$el.requestSubmit()" :disabled="isPasswordChanging">
          <span v-if="isPasswordChanging" class="flex items-center gap-2"> <Spinner /> Updating </span>
          <span v-else>Update Password</span>
        </Button>
      </template>
    </ResponsiveFormDialog>
  </section>
</template>

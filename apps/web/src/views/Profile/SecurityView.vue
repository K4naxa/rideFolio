<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { passwordUpdateSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { Field, useForm } from "vee-validate";
import { authClient } from "@/lib/authClient";
import { toast } from "vue-sonner";

const { handleSubmit, setFieldError, resetForm } = useForm({
  name: "changePasswordForm",
  validationSchema: toTypedSchema(passwordUpdateSchema),
  initialValues: {
    currentPassword: "",
    newPassword: "",
    revokeOtherSessions: true,
  },
});

const onSubmit = handleSubmit(async (values) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  const { data, error } = await authClient.changePassword(
    {
      ...values,
      callbackURL: import.meta.env.VITE_FRONTEND_URL + "/dashboard",
    },
    {
      onError: (error) => {
        console.error("Error changing password:", error);
        if (error.error.message.includes("Invalid password")) {
          setFieldError("currentPassword", "Invalid password");
        } else {
          toast.error("Failed to change password. Please try again.");
        }
      },
      onSuccess: () => {
        toast.success("Password changed successfully.");
        resetForm();
      },
    },
  );
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Change Password</CardTitle>
      <CardDescription>Update your password for improved security</CardDescription>
    </CardHeader>
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <CardContent>
        <Input name="currentPassword" type="password" placeholder="Current Password" label="Current Password" />
        <Input name="newPassword" type="password" placeholder="New Password" class="mt-4" label="New Password" />
        <Field v-slot="{ value, handleChange }" name="revokeOtherSessions">
          <Label class="mt-4 flex items-center gap-2">
            <Checkbox class="size-5" :model-value="value" @change="handleChange" />
            <p class="font-semibold">Log out other sessions</p>
          </Label>
        </Field>
      </CardContent>
      <CardFooter>
        <Button type="submit" variant="secondary" class="w-full font-semibold">Change Password</Button>
      </CardFooter>
    </form>
  </Card>
</template>

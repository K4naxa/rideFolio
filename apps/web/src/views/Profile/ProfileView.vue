<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import { useUser } from "@/lib/queries/useUserQueries";
import { profileUpdateSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { watch } from "vue";
import { toast } from "vue-sonner";

const { currentUser, updateProfile } = useUser();

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(profileUpdateSchema),
  initialValues: {
    name: "",
    email: "",
  },
});

watch(
  () => currentUser?.value,
  (newUser) => {
    if (newUser) {
      setFieldValue("name", newUser.name);
      setFieldValue("email", newUser.email);
    }
  },
);

const onSubmit = handleSubmit((values) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  updateProfile(values, {
    onError: (error) => {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    },
  });
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Profile</CardTitle>
      <CardDescription>Manage your profile information and settings</CardDescription>
    </CardHeader>
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <CardContent>
        <Input name="name" type="text" placeholder="Name" label="Username" />
        <Input name="email" type="email" placeholder="Email" class="mt-4" label="Email" />
      </CardContent>
      <CardFooter>
        <Button type="submit" variant="secondary" class="w-full font-semibold">Update Profile</Button>
      </CardFooter>
    </form>
  </Card>
</template>

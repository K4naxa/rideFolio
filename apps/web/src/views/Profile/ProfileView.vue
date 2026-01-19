<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useUserUpdate } from "@/lib/queries/user/user-mutations";
import { useUserStorageSummary } from "@/lib/queries/user/user-queries";
import StorageUsageSection from "@/views/Profile/components/StorageUsageSection.vue";
import VehicleSlotElement from "@/views/Profile/components/VehicleSlotElement.vue";
import { profileUpdateSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { watch } from "vue";
import { toast } from "vue-sonner";

const { currentUser } = useCurrentUser();
const { mutateAsync: updateProfile } = useUserUpdate();
const { data: storageSummary, isLoading: isStorageLoading, isError: isStorageError } = useUserStorageSummary();

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
  <div class="space-y-8">
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

    <div class="space-y-6">
      <div class="mb-2">
        <h3>Usage Summary</h3>
        <span class="text-muted-foreground text-sm">Your current plan limits</span>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StorageUsageSection :storage="storageSummary?.storage" :isLoading="isStorageLoading" />

        <VehicleSlotElement :used="storageSummary?.vehicles.used ?? 0" :limit="storageSummary?.vehicles.limit ?? 0" />
      </div>

      <div class="cardPrimaryBackground border-primary space-y-6 rounded border p-4 py-6">
        <div class="flex items-center gap-4">
          <div class="bg-primary/15 grid aspect-square h-10 w-10 shrink-0 place-content-center rounded">
            <Icon name="subscription" class="stroke-primary" />
          </div>
          <div>
            <h3>Unlock More</h3>
            <p class="text-muted-foreground text-sm">Upgrade your plan to unlock more storage and vehicle slots.</p>
          </div>
        </div>
        <Button class="w-full">Upgrade plan </Button>
      </div>
    </div>
  </div>
</template>

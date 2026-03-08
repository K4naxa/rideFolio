<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import Label from "@/components/ui/label/Label.vue";

import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useGroupCreate, useGroupUpdate } from "@/lib/queries/groups/group-mutations";
import { useGroupDetails } from "@/lib/queries/groups/group-queries";
import { useModalStore } from "@/stores/modal";
import { GroupSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { twMerge } from "tailwind-merge";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import FormInput from "@/components/forms/FormInput.vue";

const router = useRouter();
const { mutateAsync: createGroup } = useGroupCreate();
const { mutateAsync: updateGroup } = useGroupUpdate();
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(GroupSchema),
  initialValues: {
    name: "",
    description: "",
    vehicleIds: [],
    membersCanAddVehicles: false,
  },
});

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "group");
const { data: group } = useGroupDetails(computed(() => (isModalOpen.value ? modalStore.itemId : undefined)));
const isEditing = computed(() => Boolean(group.value));
const handleClose = () => {
  modalStore.onClose();
};

const { usersOwnVehicles } = useCurrentUser();

watch([isModalOpen, group], ([open, groupData]) => {
  if (!open) return;

  if (isEditing.value && groupData) {
    resetForm({
      values: {
        name: groupData.name,
        description: groupData.description || "",
        vehicleIds: groupData.vehicles.map((v) => v.data.id),
        membersCanAddVehicles: Boolean(groupData.rules.membersCanAddVehicles),
      },
    });
  } else {
    resetForm({
      values: {
        name: "",
        description: "",
        vehicleIds: [],
        membersCanAddVehicles: false,
      },
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Submitting group form:", values);
  if (group.value) {
    try {
      console.log("Updating group:", values);
      await updateGroup(
        { groupId: group.value.id, values },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: () => {
            toast.error("Something went wrong, please try again.");
          },
        },
      );
    } catch (error) {
      toast.error("Something went wrong, please try again.");
      console.log("Failed to update group:", error);
    }
  } else {
    console.log("Creating group:", values);
    await createGroup(values, {
      onSuccess: (data) => {
        toast.success("Group created successfully!");
        router.push("/groups/" + data.newGroupId);
        handleClose();
      },
      onError: () => {
        toast.error("Failed to create group. Please try again.");
      },
    });
  }

  handleClose();
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="text-foreground max-w-4xl">
      <DialogHeader>
        <DialogTitle>{{ group?.name || "Create a New Group" }}</DialogTitle>
        <DialogDescription>
          {{
            group
              ? "Edit your group details and manage its vehicles and permissions."
              : "Fill out the details below to create a new group and start sharing your vehicles."
          }}
        </DialogDescription>
      </DialogHeader>

      <!--  Form-->
      <form @submit.prevent="onSubmit" class="gaps-md flex flex-col justify-between">
        <!-- Group info -->
        <div class="flex flex-col gap-4">
          <!-- name / type -->
          <FormInput name="name" type="text" label="Name" placeholder="Family Group" maxlength="50" required />

          <!-- description -->
          <Textarea name="description" placeholder="Describe your group" :maxlength="200" label="Description" />
        </div>

        <!-- Member permissions -->
        <div class="overflow-hidden">
          <Label class="text-muted-foreground mb-1">Member Permissions</Label>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field v-slot="{ value, handleChange }" name="membersCanAddVehicles">
              <label class="flex items-center gap-4 rounded border p-3" data-cy="membersCanAddVehicles-checkbox">
                <Checkbox :model-value="value" @update:model-value="handleChange" />
                <div>
                  <h4>Allow members to add vehicles</h4>
                  <p class="text-muted-foreground text-sm">
                    Members can add their own vehicles to the group. Only group admins can remove vehicles
                  </p>
                </div>
                <ErrorMessage name="membersCanAddVehicles" class="text-destructive mt-1 ml-2 text-sm" />
              </label>
            </Field>
          </div>
        </div>

        <!-- Vehicles -->
        <div>
          <header class="mb-1 px-0">
            <Label v-if="!isEditing" class="text-muted-foreground">Add vehicles</Label>
            <Label v-else class="text-muted-foreground">Manage vehicles</Label>
          </header>

          <div class="">
            <Empty v-if="usersOwnVehicles.length < 1 && !isEditing" class="h-24">
              <EmptyTitle>No vehicles available</EmptyTitle>
              <EmptyDescription>
                You don't have any vehicles to add to this group. Create a vehicle first to add it to the group.
              </EmptyDescription>
            </Empty>

            <Field v-else v-slot="{ value, handleChange }" name="vehicleIds" class="">
              <ErrorMessage name="vehicleIds" class="text-destructive mt-1 ml-2 text-sm" />

              <!-- Add own vehicles if creating -->
              <ul v-if="!isEditing" class="scrollbar-macos w-full min-w-0 space-y-3 overflow-hidden pb-3">
                <li
                  v-for="{ vehicleData } in usersOwnVehicles"
                  :key="vehicleData.id"
                  @click="
                    handleChange(
                      value?.includes(vehicleData.id)
                        ? value.filter((id: string) => id !== vehicleData.id)
                        : [...(value || []), vehicleData.id],
                    )
                  "
                  :class="
                    twMerge(
                      'listHover flex cursor-pointer items-center gap-3 rounded border p-2',
                      value?.includes(vehicleData.id) ? 'border-primary!' : 'border-border',
                    )
                  "
                >
                  <VehicleItem :vehicle="vehicleData" variant="small" />
                  <Icon name="check" class="text-primary mr-2 ml-auto" v-show="value?.includes(vehicleData.id)" />
                </li>
              </ul>

              <!-- Manage existing vehicles if editing -->
              <ul v-else class="scrollbar-macos w-full min-w-0 space-y-3 overflow-hidden pb-3">
                <li
                  v-for="{ data } in group?.vehicles"
                  :key="data.id"
                  @click="
                    handleChange(
                      value?.includes(data.id)
                        ? value.filter((id: string) => id !== data.id)
                        : [...(value || []), data.id],
                    )
                  "
                  :class="
                    twMerge(
                      'listHover flex cursor-pointer items-center gap-3 rounded border p-2',
                      value?.includes(data.id) ? 'border-primary!' : 'border-border',
                    )
                  "
                >
                  <VehicleItem :vehicle="data" variant="small" />
                  <Icon name="check" class="text-primary mr-2 ml-auto" v-show="value?.includes(data.id)" />
                </li>
              </ul>
            </Field>
          </div>
        </div>

        <DialogFooter class="mb-4">
          <Button :disabled="isSubmitting" data-cy="submit-refill-btn" @click="onSubmit">
            <span v-if="!isSubmitting">
              {{ group ? "Save Changes" : "Create Group" }}
            </span>
            <span v-else>
              <Spinner />
              {{ group ? "Saving.." : "Creating.." }}
            </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-refill-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>

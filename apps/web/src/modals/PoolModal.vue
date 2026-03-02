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
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { usePoolCreate, usePoolUpdate } from "@/lib/queries/pools/pool-mutations";
import { usePoolDetails } from "@/lib/queries/pools/pool-queries";
import { useModalStore } from "@/stores/modal";
import { getPoolTypeIcon, POOL_TYPES, PoolSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { AnimatePresence, Motion } from "motion-v";
import { twMerge } from "tailwind-merge";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

const router = useRouter();
const { mutateAsync: createPool } = usePoolCreate();
const { mutateAsync: updatePool } = usePoolUpdate();
const { handleSubmit, values, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(PoolSchema),
  initialValues: {
    name: "",
    description: "",
    type: "PRIVATE",
    vehicleIds: [],
    membersCanAddLogs: true,
    membersCanAddVehicles: false,
    membersCanDeleteLogs: true,
    membersCanEditLogs: true,
  },
});

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "pool");
const { data: pool } = usePoolDetails(computed(() => (isModalOpen.value ? modalStore.itemId : undefined)));
const isEditing = computed(() => Boolean(pool.value));
const handleClose = () => {
  modalStore.onClose();
};

const showMemberSettings = computed(() => values.type !== "PRIVATE");
const { usersOwnVehicles } = useCurrentUser();

watch([isModalOpen, pool], ([open, poolData]) => {
  if (!open) return;

  if (isEditing.value && poolData) {
    resetForm({
      values: {
        name: poolData.name,
        description: poolData.description || "",
        type: poolData.type,
        vehicleIds: poolData.vehicles.map((v) => v.data.id),
        membersCanAddLogs: Boolean(poolData.rules.membersCanAddLogs),
        membersCanAddVehicles: Boolean(poolData.rules.membersCanAddVehicles),
        membersCanDeleteLogs: Boolean(poolData.rules.membersCanDeleteLogs),
        membersCanEditLogs: Boolean(poolData.rules.membersCanEditLogs),
      },
    });
  } else {
    resetForm({
      values: {
        name: "",
        description: "",
        type: "PRIVATE",
        vehicleIds: [],
        membersCanAddLogs: true,
        membersCanAddVehicles: false,
        membersCanDeleteLogs: true,
        membersCanEditLogs: true,
      },
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Submitting pool form:", values);
  if (pool.value) {
    try {
      console.log("Updating pool:", values);
      await updatePool(
        { poolId: pool.value.id, values },
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
      console.log("Failed to update pool:", error);
    }
  } else {
    console.log("Creating pool:", values);
    await createPool(values, {
      onSuccess: (data) => {
        toast.success("Group created successfully!");
        router.push("/pools/" + data.newPoolId);
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
      <DialogHeader class="mb-4">
        <DialogTitle>{{ pool?.name || "Create a New Group" }}</DialogTitle>
        <DialogDescription>
          <p v-if="pool">
            Edit the details of your group <strong>{{ pool.name }}</strong>
          </p>
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="gaps-md flex flex-col justify-between">
        <!-- Group info -->
        <div>
          <div class="gaps-md flex flex-col">
            <!-- name / type -->
            <div class="gaps-md grid grid-cols-1 place-content-end items-end md:grid-cols-2">
              <Input name="name" type="text" label="Name" placeholder="Family Group" maxlength="50" required />
              <Field v-slot="{ value, handleChange }" name="type">
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full">
                    <div class="flex items-center gap-3">
                      <Icon
                        v-if="value"
                        :name="getPoolTypeIcon(value) as IconProps['name']"
                        class="stroke-muted-foreground"
                      />
                      <SelectValue placeholder="Select maintenance type *" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="type in POOL_TYPES" :key="type.code" :value="type.code" class="flex gap-2">
                      <Icon v-if="type.icon" :name="type.icon as IconProps['name']" class="stroke-muted-foreground" />
                      <p class="capitalize">{{ type.label }}</p>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="typeId" class="text-destructive mt-1 ml-1 text-sm" />
              </Field>
            </div>

            <!-- description -->
            <Textarea
              name="description"
              placeholder="Describe your pool"
              :maxlength="200"
              label="Description"
              class="mt-4 md:mt-2"
            />
          </div>
        </div>

        <!-- Member permissions -->
        <AnimatePresence>
          <Motion
            v-if="showMemberSettings"
            :initial="{ opacity: 0, height: 0 }"
            :animate="{ opacity: 1, height: 'auto' }"
            :exit="{ opacity: 0, height: 0 }"
            :transition="{ duration: 0.25, ease: 'easeOut' }"
            class="overflow-hidden"
          >
            <div class="mb-4 space-y-2">
              <Label class="text-muted-foreground mb-1">Member Permissions</Label>
              <Separator />
            </div>

            <div class="gaps-sm grid grid-cols-1 md:grid-cols-2">
              <Field v-slot="{ value, handleChange }" name="membersCanAddLogs">
                <label class="flex items-center gap-4 rounded border p-3" data-cy="membersCanAddLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to create logs</h4>
                    <p class="text-muted-foreground text-sm">Members can create new logs for the groups vehicles</p>
                  </div>
                  <ErrorMessage name="membersCanAddLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

              <Field v-slot="{ value, handleChange }" name="membersCanEditLogs">
                <label class="flex items-center gap-4 rounded border p-3" data-cy="membersCanEditLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to edit logs</h4>
                    <p class="text-muted-foreground text-sm">Members can edit existing logs for the groups vehicles</p>
                  </div>
                  <ErrorMessage name="membersCanEditLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

              <Field v-slot="{ value, handleChange }" name="membersCanDeleteLogs">
                <label class="flex items-center gap-4 rounded border p-3" data-cy="membersCanDeleteLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to delete logs</h4>
                    <p class="text-muted-foreground text-sm">
                      Members can delete existing logs for the groups vehicles
                    </p>
                  </div>
                  <ErrorMessage name="membersCanDeleteLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

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
          </Motion>
        </AnimatePresence>

        <!-- Vehicles -->
        <div class="mt-6">
          <header class="mb-4 px-0">
            <Label v-if="!isEditing" class="text-muted-foreground mb-1">Add vehicles</Label>
            <Label v-else class="text-muted-foreground mb-1">Manage vehicles</Label>
            <Separator />
          </header>

          <div class="min-h-36">
            <Empty v-if="usersOwnVehicles.length < 1 && !isEditing" class="h-36">
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
                  for="selectedVehicle"
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
                  v-for="{ data } in pool?.vehicles"
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

        <DialogFooter class="pt-8">
          <Button type="submit" :disabled="isSubmitting" data-cy="submit-refill-btn" @click="onSubmit">
            <span v-if="!isSubmitting">
              {{ pool ? "Save Changes" : "Create Group" }}
            </span>
            <span v-else>
              <Spinner />
              {{ pool ? "Saving.." : "Creating.." }}
            </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-refill-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>

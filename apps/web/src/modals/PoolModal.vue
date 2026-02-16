<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
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
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { usePoolCreate } from "@/lib/queries/pools/pool-mutations";
import { useModalStore } from "@/stores/modal";
import { getPoolTypeIcon, POOL_TYPES, PoolSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { Check } from "lucide-vue-next";
import { AnimatePresence, Motion } from "motion-v";
import { twMerge } from "tailwind-merge";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { mutateAsync: createPool } = usePoolCreate();
const { handleSubmit, values, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(PoolSchema),
  initialValues: {
    name: "",
    description: "",
    type: "PRIVATE",
    vehicleIds: [],
    allowMembersToAddLogs: true,
    allowMembersToAddVehicles: false,
    allowMembersToDeleteLogs: true,
    allowMembersToEditLogs: true,
  },
});

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "pool");
const handleClose = () => {
  modalStore.onClose();
};

const showMemberSettings = computed(() => values.type !== "PRIVATE");
const { usersOwnVehicles } = useCurrentUser();

watch(isModalOpen, (open) => {
  if (open) {
    resetForm({
      values: {
        name: "",
        description: "",
        type: "PRIVATE",
        vehicleIds: [],
        allowMembersToAddLogs: true,
        allowMembersToAddVehicles: false,
        allowMembersToDeleteLogs: true,
        allowMembersToEditLogs: true,
      },
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Creating pool with values:", values);
  const res = await createPool(values);
  await router.push("/pools/" + res.newPoolId);
  handleClose();
});

watchEffect(() => {
  console.log("Selected vehicle IDs:", values.vehicleIds);
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="text-foreground max-w-4xl">
      <DialogHeader class="">
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogDescription> Start by filling out the details below to set up your new group. </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="gaps-md flex flex-col justify-between">
        <!-- Group info -->
        <div>
          <header class="mb-4 space-y-2 px-0">
            <Label class="text-muted-foreground">Group info</Label>
            <Separator />
          </header>

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
              <Label class="text-muted-foreground mb-4">Member Permissions</Label>
              <Separator />
            </div>

            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Field v-slot="{ value, handleChange }" name="allowMembersToAddLogs">
                <label class="flex items-center gap-4" data-cy="allowMembersToAddLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to create logs</h4>
                    <p class="text-muted-foreground text-sm">Members can create new logs for the groups vehicles</p>
                  </div>
                  <ErrorMessage name="allowMembersToAddLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

              <Field v-slot="{ value, handleChange }" name="allowMembersToEditLogs">
                <label class="flex items-center gap-4" data-cy="allowMembersToEditLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to edit logs</h4>
                    <p class="text-muted-foreground text-sm">Members can edit existing logs for the groups vehicles</p>
                  </div>
                  <ErrorMessage name="allowMembersToEditLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

              <Field v-slot="{ value, handleChange }" name="allowMembersToDeleteLogs">
                <label class="flex items-center gap-4" data-cy="allowMembersToDeleteLogs-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to delete logs</h4>
                    <p class="text-muted-foreground text-sm">
                      Members can delete existing logs for the groups vehicles
                    </p>
                  </div>
                  <ErrorMessage name="allowMembersToDeleteLogs" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>

              <Field v-slot="{ value, handleChange }" name="allowMembersToAddVehicles">
                <label class="flex items-center gap-4" data-cy="allowMembersToAddVehicles-checkbox">
                  <Checkbox :model-value="value" @update:model-value="handleChange" />
                  <div>
                    <h4>Allow members to add vehicles</h4>
                    <p class="text-muted-foreground text-sm">
                      Members can add their own vehicles to the group. Only group admins can remove vehicles
                    </p>
                  </div>
                  <ErrorMessage name="allowMembersToAddVehicles" class="text-destructive mt-1 ml-2 text-sm" />
                </label>
              </Field>
            </div>
          </Motion>
        </AnimatePresence>

        <!-- Vehicles -->
        <div class="mt-6">
          <header class="mb-4 space-y-2 px-0">
            <Label class="text-muted-foreground">Add vehicles</Label>
            <Separator />
          </header>

          <div class="min-h-36">
            <Empty v-if="usersOwnVehicles.length < 1" class="h-36">
              <EmptyTitle>No vehicles available</EmptyTitle>
              <EmptyDescription>
                You don't have any vehicles to add to this group. Create a vehicle first to add it to the group.
              </EmptyDescription>
            </Empty>

            <Field v-else v-slot="{ value, handleChange }" name="vehicleIds" class="">
              <ErrorMessage name="vehicleIds" class="text-destructive mt-1 ml-2 text-sm" />
              <ul class="scrollbar-macos w-full min-w-0 space-y-3 overflow-hidden pb-3">
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
            </Field>
          </div>
        </div>

        <DialogFooter class="pt-8">
          <Button type="submit" :disabled="isSubmitting" data-cy="submit-refill-btn">
            <span v-if="!isSubmitting">Create</span>
            <span v-else> <Spinner /> Creating.. </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-refill-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>

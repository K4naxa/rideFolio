<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Avatar } from "@/components/ui/avatar";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { userNotificationMarkAsRead } from "@/lib/queries/notifications/notification-mutations";
import { useGroupAddVehicles, useGroupInviteAccept, useGroupInviteDeny } from "@/lib/queries/groups/group-mutations";
import { getInitials } from "@/lib/utils";
import type { Notification } from "@repo/validation";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import Label from "@/components/ui/label/Label.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { array, cuid, object } from "zod";
import { toast } from "vue-sonner";
import { twMerge } from "tailwind-merge";
import Icon from "@/components/icons/Icon.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";

const props = defineProps<{
  notification: Notification<"GROUP_INVITE">;
  open?: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { mutateAsync: acceptInvite, isPending: isAccepting } = useGroupInviteAccept();
const { mutateAsync: denyInvite, isPending: isDenying } = useGroupInviteDeny();
const { mutateAsync: addVehiclesToGroup } = useGroupAddVehicles();

const { mutate: markAsRead } = userNotificationMarkAsRead();
const { usersOwnVehicles } = useCurrentUser();

type Stage = "invite" | "vehicles";
const stage = ref<Stage>("invite");

const hasOwnVehicles = computed(() => usersOwnVehicles.value && usersOwnVehicles.value.length > 0);

function handleAccept() {
  acceptInvite(props.notification.metadata.inviteId, {
    onSuccess: () => {
      console.log("Invite accepted successfully");
      if (hasOwnVehicles.value && props.notification.metadata.membersCanAddVehicles) {
        console.log("User can add vehicles, moving to vehicle selection stage");
        stage.value = "vehicles";
      } else {
        emit("update:open", false);
      }
      markAsRead(props.notification.id);
    },
  });
}

function handleDeny() {
  denyInvite(props.notification.metadata.inviteId, {
    onSuccess: () => {
      markAsRead(props.notification.id);
      emit("update:open", false);
    },
  });
}

function handleClose() {
  emit("update:open", false);
}

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: toTypedSchema(object({ groupId: cuid(), vehicleIds: array(cuid()) })),
  initialValues: {
    groupId: props.notification.metadata.groupId,
    vehicleIds: [],
  },
});

const submit = handleSubmit(async (values) => {
  await addVehiclesToGroup(values, {
    onSuccess() {
      emit("update:open", false);
    },
    onError() {
      toast.error("Failed to add vehicles to the group. Please try again.");
    },
  });
});

watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      stage.value = "invite";
      resetForm({
        values: {
          vehicleIds: [],
        },
      });
    }
  },
);
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <slot name="trigger" />

    <DialogContent class="w-full max-w-md overflow-hidden" @interact-outside="(e) => e.preventDefault()">
      <Transition name="slide-left" mode="out-in" class="">
        <div v-if="stage === 'invite'" key="invite" class="gaps-md flex flex-col">
          <!-- ─── STAGE 1: Invitation ─────────────────────────────── -->

          <!-- Header band -->
          <DialogHeader>
            <DialogTitle> Group Invitation </DialogTitle>
            <DialogDescription> You've been invited to join a group </DialogDescription>
          </DialogHeader>

          <!-- Body -->
          <div class="gaps-md flex flex-col">
            <!-- Group info -->
            <div class="">
              <Label class="text-muted-foreground mb-1 text-xs">Group</Label>
              <p class="text-sm font-semibold">{{ notification.metadata.groupName }}</p>
              <p v-if="notification.metadata.groupDescription" class="text-muted-foreground text-xs leading-relaxed">
                {{ notification.metadata.groupDescription }}
              </p>
            </div>

            <!-- Sender row -->
            <div class="flex items-center gap-3">
              <Avatar class="size-10">
                <AvatarImage v-if="notification.metadata.sender.image" :src="notification.metadata.sender.image" />
                <AvatarFallback>
                  {{ getInitials(notification.metadata.sender.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <Label class="text-muted-foreground text-xs">Invited by</Label>
                <p class="truncate font-semibold">{{ notification.metadata.sender.name }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <DialogFooter class="">
            <Button variant="outline" :disabled="isDenying || isAccepting" @click="handleDeny">
              <Spinner v-if="isDenying" class="mr-2 size-4" />
              {{ isDenying ? "Declining…" : "Decline" }}
            </Button>
            <Button :disabled="isDenying || isAccepting" @click="handleAccept">
              <Spinner v-if="isAccepting" class="mr-2 size-4" />
              {{ isAccepting ? "Joining…" : "Accept" }}
            </Button>
          </DialogFooter>
        </div>

        <div v-else key="vehicles" class="gaps-md flex flex-col">
          <!-- ─── STAGE 2: Add Vehicles ───────────────────────────── -->
          <!-- Header band -->
          <DialogHeader>
            <DialogTitle>Share your vehicles with the group</DialogTitle>
            <DialogDescription> You can always add them later from the group settings.</DialogDescription>
          </DialogHeader>

          <!-- Vehicle list -->
          <div>
            <Field v-slot="{ value, handleChange }" name="vehicleIds" class="">
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

          <!-- Footer -->
          <DialogFooter>
            <Button variant="outline" @click="handleClose()"> Skip </Button>
            <Button :disabled="values.vehicleIds?.length === 0" @click="submit()"> Add & Done </Button>
          </DialogFooter>
        </div>
      </Transition>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* ── Stage pill ── */
.stage-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.stage-pill--green {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.22);
}
</style>

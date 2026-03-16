<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Avatar } from "@/components/ui/avatar";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Icon from "@/components/icons/Icon.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { userNotificationMarkAsRead } from "@/lib/queries/notifications/notification-mutations";
import { useGroupAddVehicles, useGroupInviteAccept, useGroupInviteDeny } from "@/lib/queries/groups/group-mutations";
import { getInitials } from "@/lib/utils";
import type { Notification } from "@repo/validation";
import { useForm } from "vee-validate";
import { array, cuid, object } from "zod";
import { toast } from "vue-sonner";
import { twMerge } from "tailwind-merge";

const props = defineProps<{
  notification: Notification<"GROUP_INVITE">;
  open?: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isMobile = useIsMobile();

const { mutateAsync: acceptInvite, isPending: isAccepting } = useGroupInviteAccept();
const { mutateAsync: denyInvite, isPending: isDenying } = useGroupInviteDeny();
const { mutateAsync: addVehiclesToGroup, isPending: isAddingVehicles } = useGroupAddVehicles();

const { mutate: markAsRead } = userNotificationMarkAsRead();
const { usersOwnVehicles } = useCurrentUser();

type Stage = "invite" | "vehicles";
const stage = ref<Stage>("invite");

const hasOwnVehicles = computed(() => usersOwnVehicles.value && usersOwnVehicles.value.length > 0);
const isBusy = computed(() => isAccepting.value || isDenying.value);

// Track whether the invite was accepted so we can mark it read on close
const wasAccepted = ref(false);

function handleAccept() {
  acceptInvite(props.notification.metadata.inviteId, {
    onSuccess: () => {
      wasAccepted.value = true;
      if (hasOwnVehicles.value && props.notification.metadata.membersCanAddVehicles) {
        stage.value = "vehicles";
      } else {
        closeAndMarkRead();
      }
    },
  });
}

function handleDeny() {
  denyInvite(props.notification.metadata.inviteId, {
    onSuccess: () => {
      closeAndMarkRead();
    },
  });
}

/** Close the modal, then mark the notification as read.
 *  Order matters — markAsRead can trigger a parent re-render that
 *  unmounts this component, so we emit close first. */
function closeAndMarkRead() {
  emit("update:open", false);
  markAsRead(props.notification.id);
}

function handleClose() {
  if (wasAccepted.value) {
    closeAndMarkRead();
  } else {
    emit("update:open", false);
  }
}

function handleOpenChange(value: boolean) {
  if (!value) handleClose();
}

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: object({ groupId: cuid(), vehicleIds: array(cuid()) }),
  initialValues: {
    groupId: props.notification.metadata.groupId,
    vehicleIds: [] as string[],
  },
});

const selectedCount = computed(() => values.vehicleIds?.length ?? 0);

function toggleVehicle(id: string) {
  const current = values.vehicleIds ?? [];
  if (current.includes(id)) {
    resetForm({
      values: { ...values, vehicleIds: current.filter((v: string) => v !== id) },
    });
  } else {
    resetForm({
      values: { ...values, vehicleIds: [...current, id] },
    });
  }
}

const submit = handleSubmit(async (formValues) => {
  await addVehiclesToGroup(formValues, {
    onSuccess() {
      closeAndMarkRead();
    },
    onError() {
      toast.error("Failed to add vehicles to the group. Please try again.");
    },
  });
});

const roleLabel = computed(() => {
  const role = props.notification.metadata.roleToGrant;
  if (role === "ADMIN") return "Admin";
  if (role === "OWNER") return "Owner";
  return "Member";
});

watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      stage.value = "invite";
      wasAccepted.value = false;
      resetForm({
        values: {
          groupId: props.notification.metadata.groupId,
          vehicleIds: [],
        },
      });
    }
  },
);
</script>

<template>
  <!-- ═══ Desktop: Dialog modal ═══ -->
  <template v-if="!isMobile">
    <Dialog :open="open" @update:open="handleOpenChange">
      <DialogScrollContent class="w-full max-w-md" @interactOutside.prevent @focusOutside.prevent>
        <Transition name="invite-stage" mode="out-in">
          <!-- ─── STAGE 1: Invitation ─── -->
          <div v-if="stage === 'invite'" key="invite" class="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Group Invitation</DialogTitle>
              <DialogDescription>You've been invited to join a group</DialogDescription>
            </DialogHeader>

            <!-- Invitation card -->
            <div class="bg-card flex flex-col gap-4 rounded-lg p-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-start justify-between gap-3">
                  <h2 class="min-w-0 truncate">{{ notification.metadata.groupName }}</h2>
                  <Badge class="bg-primary/15 text-primary shrink-0 rounded-md text-xs font-medium">
                    {{ roleLabel }}
                  </Badge>
                </div>
                <p v-if="notification.metadata.groupDescription" class="text-muted-foreground text-sm leading-relaxed">
                  {{ notification.metadata.groupDescription }}
                </p>
              </div>

              <Separator />

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <Icon name="users" class="text-muted-foreground size-3.5" />
                  <span class="text-muted-foreground text-xs">
                    {{ notification.metadata.memberCount }}
                    {{ notification.metadata.memberCount === 1 ? "member" : "members" }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Icon name="car" class="text-muted-foreground size-3.5" />
                  <span class="text-muted-foreground text-xs">
                    {{ notification.metadata.vehicleCount }}
                    {{ notification.metadata.vehicleCount === 1 ? "vehicle" : "vehicles" }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Sender attribution -->
            <div class="flex items-center gap-2">
              <Avatar class="size-6">
                <AvatarImage v-if="notification.metadata.sender.image" :src="notification.metadata.sender.image" />
                <AvatarFallback class="text-xs">
                  {{ getInitials(notification.metadata.sender.name) }}
                </AvatarFallback>
              </Avatar>
              <p class="text-muted-foreground text-xs">
                Invited by
                <span class="text-foreground font-medium">{{ notification.metadata.sender.name }}</span>
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" :disabled="isBusy" @click="handleDeny">
                <Spinner v-if="isDenying" class="size-4" />
                {{ isDenying ? "Declining\u2026" : "Decline" }}
              </Button>
              <Button :disabled="isBusy" @click="handleAccept">
                <Spinner v-if="isAccepting" class="size-4" />
                {{ isAccepting ? "Joining\u2026" : "Accept & Join" }}
              </Button>
            </DialogFooter>
          </div>

          <!-- ─── STAGE 2: Add Vehicles ─── -->
          <div v-else key="vehicles" class="flex flex-col gap-5">
            <DialogHeader>
              <div class="flex items-center gap-2">
                <div class="bg-success flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Icon name="check" class="text-status-fg size-3.5" />
                </div>
                <span class="text-muted-foreground text-sm">
                  Joined <span class="text-foreground font-medium">{{ notification.metadata.groupName }}</span>
                </span>
              </div>
              <DialogTitle class="mt-1">Bring your vehicles</DialogTitle>
              <DialogDescription>
                Select vehicles to share with the group. You can always add or remove them later.
              </DialogDescription>
            </DialogHeader>

            <ul
              class="scrollbar-macos flex w-full min-w-0 flex-col gap-2 overflow-hidden"
              role="listbox"
              aria-label="Your vehicles"
            >
              <li
                v-for="{ vehicleData } in usersOwnVehicles"
                :key="vehicleData.id"
                role="option"
                :aria-selected="values.vehicleIds?.includes(vehicleData.id)"
                tabindex="0"
                @click="toggleVehicle(vehicleData.id)"
                @keydown.enter.prevent="toggleVehicle(vehicleData.id)"
                @keydown.space.prevent="toggleVehicle(vehicleData.id)"
                :class="
                  twMerge(
                    'listHover flex cursor-pointer items-center gap-3 rounded-lg border p-2',
                    values.vehicleIds?.includes(vehicleData.id) ? 'border-primary bg-primary/5' : 'border-border',
                  )
                "
              >
                <Checkbox
                  :model-value="values.vehicleIds?.includes(vehicleData.id)"
                  class="pointer-events-none ml-1 shrink-0"
                  tabindex="-1"
                  aria-hidden="true"
                />
                <VehicleItem :vehicle="vehicleData" variant="small" />
              </li>
            </ul>

            <DialogFooter>
              <Button variant="outline" @click="handleClose">Skip for now</Button>
              <Button :disabled="selectedCount === 0 || isAddingVehicles" @click="submit()">
                <Spinner v-if="isAddingVehicles" class="size-4" />
                <template v-if="isAddingVehicles">Adding&hellip;</template>
                <template v-else-if="selectedCount > 0">
                  Add {{ selectedCount }} {{ selectedCount === 1 ? "vehicle" : "vehicles" }}
                </template>
                <template v-else>Select vehicles</template>
              </Button>
            </DialogFooter>
          </div>
        </Transition>
      </DialogScrollContent>
    </Dialog>
  </template>

  <!-- ═══ Mobile: Bottom sheet drawer ═══ -->
  <template v-else>
    <Drawer :open="open" @update:open="handleOpenChange">
      <DrawerContent class="data-[vaul-drawer-direction=bottom]:max-h-[90vh]" dismiss-from-pill>
        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <Transition name="invite-stage" mode="out-in">
            <!-- ─── STAGE 1: Invitation ─── -->
            <div v-if="stage === 'invite'" key="invite" class="flex flex-col gap-5">
              <DrawerHeader class="border-b text-left">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex flex-col gap-1">
                    <DrawerTitle>Group Invitation</DrawerTitle>
                    <DrawerDescription class="text-left"> You've been invited to join a group </DrawerDescription>
                  </div>
                  <Button variant="ghost" size="icon-sm" class="shrink-0" @click="handleClose">
                    <Icon name="close" class="size-4" />
                  </Button>
                </div>
              </DrawerHeader>

              <div class="flex flex-col gap-5 px-4 pb-2">
                <!-- Invitation card -->
                <div class="bg-background flex flex-col gap-4 rounded-lg border p-4">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-start justify-between gap-3">
                      <h2 class="min-w-0 truncate">{{ notification.metadata.groupName }}</h2>
                      <Badge class="bg-primary/15 text-primary shrink-0 rounded-md text-xs font-medium">
                        {{ roleLabel }}
                      </Badge>
                    </div>
                    <p
                      v-if="notification.metadata.groupDescription"
                      class="text-muted-foreground text-sm leading-relaxed"
                    >
                      {{ notification.metadata.groupDescription }}
                    </p>
                  </div>

                  <Separator />

                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                      <Icon name="users" class="text-muted-foreground size-3.5" />
                      <span class="text-muted-foreground text-xs">
                        {{ notification.metadata.memberCount }}
                        {{ notification.metadata.memberCount === 1 ? "member" : "members" }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <Icon name="car" class="text-muted-foreground size-3.5" />
                      <span class="text-muted-foreground text-xs">
                        {{ notification.metadata.vehicleCount }}
                        {{ notification.metadata.vehicleCount === 1 ? "vehicle" : "vehicles" }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Sender attribution -->
                <div class="flex items-center gap-2">
                  <Avatar class="size-6">
                    <AvatarImage v-if="notification.metadata.sender.image" :src="notification.metadata.sender.image" />
                    <AvatarFallback class="text-xs">
                      {{ getInitials(notification.metadata.sender.name) }}
                    </AvatarFallback>
                  </Avatar>
                  <p class="text-muted-foreground text-sm">
                    Invited by
                    <span class="text-foreground font-medium">{{ notification.metadata.sender.name }}</span>
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex flex-col gap-2 px-4 pb-4">
                <Button :disabled="isBusy" @click="handleAccept" class="w-full">
                  <Spinner v-if="isAccepting" class="size-4" />
                  {{ isAccepting ? "Joining\u2026" : "Accept & Join" }}
                </Button>
                <Button variant="outline" :disabled="isBusy" @click="handleDeny" class="w-full">
                  <Spinner v-if="isDenying" class="size-4" />
                  {{ isDenying ? "Declining\u2026" : "Decline" }}
                </Button>
              </div>
            </div>

            <!-- ─── STAGE 2: Add Vehicles ─── -->
            <div v-else key="vehicles" class="flex flex-col gap-5">
              <DrawerHeader class="border-b text-left">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <div class="bg-success flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Icon name="check" class="text-status-fg size-3" />
                      </div>
                      <span class="text-muted-foreground text-xs">
                        Joined <span class="text-foreground font-medium">{{ notification.metadata.groupName }}</span>
                      </span>
                    </div>
                    <DrawerTitle>Bring your vehicles</DrawerTitle>
                    <DrawerDescription class="text-left text-xs">
                      Select vehicles to share with the group. You can always add or remove them later.
                    </DrawerDescription>
                  </div>
                  <Button variant="ghost" size="icon-sm" class="shrink-0" @click="handleClose">
                    <Icon name="close" class="size-4" />
                  </Button>
                </div>
              </DrawerHeader>

              <ul
                class="scrollbar-macos flex w-full min-w-0 flex-col gap-2 overflow-hidden px-4"
                role="listbox"
                aria-label="Your vehicles"
              >
                <li
                  v-for="{ vehicleData } in usersOwnVehicles"
                  :key="vehicleData.id"
                  role="option"
                  :aria-selected="values.vehicleIds?.includes(vehicleData.id)"
                  tabindex="0"
                  @click="toggleVehicle(vehicleData.id)"
                  @keydown.enter.prevent="toggleVehicle(vehicleData.id)"
                  @keydown.space.prevent="toggleVehicle(vehicleData.id)"
                  :class="
                    twMerge(
                      'listHover flex cursor-pointer items-center gap-3 rounded-lg border p-2',
                      values.vehicleIds?.includes(vehicleData.id) ? 'border-primary bg-primary/5' : 'border-border',
                    )
                  "
                >
                  <Checkbox
                    :model-value="values.vehicleIds?.includes(vehicleData.id)"
                    class="pointer-events-none ml-1 shrink-0"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                  <VehicleItem :vehicle="vehicleData" variant="small" />
                </li>
              </ul>

              <!-- Footer -->
              <div class="flex flex-col gap-2 px-4 pb-4">
                <Button :disabled="selectedCount === 0 || isAddingVehicles" @click="submit()" class="w-full">
                  <Spinner v-if="isAddingVehicles" class="size-4" />
                  <template v-if="isAddingVehicles">Adding&hellip;</template>
                  <template v-else-if="selectedCount > 0">
                    Add {{ selectedCount }} {{ selectedCount === 1 ? "vehicle" : "vehicles" }}
                  </template>
                  <template v-else>Select vehicles</template>
                </Button>
                <Button variant="outline" @click="handleClose" class="w-full">Skip for now</Button>
              </div>
            </div>
          </Transition>
        </div>
      </DrawerContent>
    </Drawer>
  </template>
</template>

<style scoped>
.invite-stage-enter-active,
.invite-stage-leave-active {
  transition: opacity 150ms ease;
}
.invite-stage-enter-from,
.invite-stage-leave-to {
  opacity: 0;
}
</style>

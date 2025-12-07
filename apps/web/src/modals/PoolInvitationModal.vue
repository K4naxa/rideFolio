<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import { Avatar } from "@/components/ui/avatar";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { usePoolInviteAccept, usePoolInviteDeny } from "@/lib/queries/pools/pool-mutations";
import { useUserNotificationsMarkAsRead } from "@/lib/queries/user/user-mutations";
import { getInitials } from "@/lib/utils";
import { useModalStore } from "@/stores/modal";
import type { PoolInviteNotification } from "@repo/validation";
import { computed } from "vue";

const modalStore = useModalStore();
const data = computed(() => (modalStore.data as { notification: PoolInviteNotification })?.notification);
const isModalOpen = computed(() => modalStore.type === "poolInvite" && modalStore.isOpen);

const { mutateAsync: acceptInvite, isPending: isAccepting } = usePoolInviteAccept();
const { mutateAsync: denyInvite, isPending: isDenying } = usePoolInviteDeny();
const { mutate: markAsRead } = useUserNotificationsMarkAsRead();

function handleAccept() {
  if (data.value) {
    acceptInvite(data.value.metadata.inviteId, {
      onSuccess: () => {
        markAsRead(data.value!.id);
        modalStore.onClose();
      },
    });
  }
}

function handleDeny() {
  if (data.value) {
    denyInvite(data.value.metadata.inviteId, {
      onSuccess: () => {
        markAsRead(data.value!.id);
        modalStore.onClose();
      },
    });
  }
}
</script>
<template>
  <Dialog :open="isModalOpen" @update:open="modalStore.onClose">
    <DialogContent class="w-full max-w-3xl">
      <DialogHeader class="mb-4">
        <DialogTitle> You have been invited to a group! </DialogTitle>
        <DialogDescription>
          Joining a group allows you to share resources and collaborate with other members. <br />
          Please review the pool information below and choose to accept or deny the invitation.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-2">
        <Label class="text-muted-foreground">Pool Information</Label>
        <div class="rounded border p-4">
          <h3>{{ data.metadata.poolName }}</h3>
          <p class="text-muted-foreground">{{ data.metadata.poolDescription }}</p>
          <div class="mt-4 flex gap-6">
            <Label class="flex items-center gap-2">
              <Icon name="users" class="stroke-muted-foreground" /> Members:
              <Badge variant="secondary"> {{ data.metadata.poolMemberCount }} </Badge>
            </Label>
            <Label class="flex items-center gap-2">
              <Icon name="carFront" class="stroke-muted-foreground" /> Vehicles:
              <Badge variant="secondary"> {{ data.metadata.poolVehicleCount }} </Badge>
            </Label>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-muted-foreground">Invitation from</Label>
        <div class="flex items-center gap-4 rounded border p-4">
          <Avatar>
            <AvatarImage v-if="data.metadata.sender.image" :src="data.metadata.sender.image" alt="Sender Avatar" />
            <AvatarFallback>{{ getInitials(data.metadata.sender.name) }}</AvatarFallback>
          </Avatar>
          <p class="font-semibold">{{ data.metadata.sender.name }}</p>
        </div>
      </div>
      <DialogFooter class="mt-4">
        <Button variant="secondary" @click="handleDeny" :disabled="isDenying || isAccepting">
          <p v-if="!isDenying">Deny</p>
          <p v-if="isDenying"><Spinner /> Denying...</p>
        </Button>
        <Button variant="default" @click="handleAccept" :disabled="isDenying || isAccepting">
          <p v-if="!isAccepting">Accept</p>
          <p v-if="isAccepting"><Spinner /> Accepting...</p>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

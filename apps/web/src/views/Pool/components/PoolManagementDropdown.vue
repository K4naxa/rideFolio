<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuGroup from "@/components/ui/dropdown-menu/DropdownMenuGroup.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { usePoolDelete, usePoolLeave } from "@/lib/queries/pools/pool-mutations";
import type { AlertModalData } from "@/modals/alertModal.vue";
import { useModalStore } from "@/stores/modal";
import type { PoolDetails } from "@repo/validation";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

interface PoolManagementDropdownProps {
  details: PoolDetails | undefined;
}

const router = useRouter();
const props = defineProps<PoolManagementDropdownProps>();
const modalStore = useModalStore();

const { mutateAsync: deletePool } = usePoolDelete();
const { mutateAsync: leavePool } = usePoolLeave();

function handleDeleteClick() {
  if (!props.details) return;
  const poolId = props.details.id;
  modalStore.onOpen("alert", {
    title: "Are you sure?",
    description: "Are you sure you want to delete this pool? This action cannot be undone.",
    variant: "destructive",
    confirmText: "Delete",
    cancelText: "Cancel",
    onConfirm: () => {
      deletePool(poolId, {
        onSuccess: () => {
          toast.success("Pool deleted successfully.");
          router.push("/dashboard");
        },
      });
    },
  });
}

function handleLeavePool() {
  if (!props.details) return;
  const poolId = props.details.id;
  modalStore.onOpen("alert", {
    title: "Are you sure?",
    description: "Are you sure you want to leave this pool? <br/> You will lose access to shared resources.",
    onAction: () => {
      leavePool(poolId, {
        onSuccess: () => {
          toast.success("You have left the pool successfully.");
          router.push("/dashboard");
        },
      });
    },
  } satisfies AlertModalData);
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Icon name="dotsHorizontal" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup v-if="props.details?.userRole === 'OWNER' || props.details?.userRole === 'ADMIN'">
        <DropdownMenuLabel><Label class="text-muted-foreground">Manage Pool</Label></DropdownMenuLabel>
        <Separator />
        <DropdownMenuItem> <Icon name="edit" /> Edit Pool </DropdownMenuItem>
        <DropdownMenuItem v-if="props.details?.userRole === 'OWNER'" variant="destructive" @click="handleDeleteClick">
          <Icon name="trash" /> Delete Pool
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuGroup v-if="props.details?.userRole !== 'OWNER'">
        <DropdownMenuLabel><Label class="text-muted-foreground">Actions</Label></DropdownMenuLabel>
        <Separator />

        <DropdownMenuItem variant="destructive" @click="handleLeavePool">
          <Icon name="logout" /> Leave group
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

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
import { useModalStore } from "@/stores/modal";
import type { PoolDetails } from "@repo/validation";

interface PoolManagementDropdownProps {
  details: PoolDetails;
}

const props = defineProps<PoolManagementDropdownProps>();
const modalStore = useModalStore();

function handleDeleteClick() {
  modalStore.onOpen("alert", {
    title: "Delete Pool",
    description: "Are you sure you want to delete this pool? This action cannot be undone.",
    variant: "destructive",
    confirmText: "Delete",
    cancelText: "Cancel",
    onConfirm: () => {
      console.log("Pool deletion confirmed.");
    },
  });
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Icon name="dotsHorizontal" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel><Label class="text-muted-foreground">Manage Pool</Label></DropdownMenuLabel>
        <Separator />
        <DropdownMenuItem v-if="props.details.userRole === 'OWNER' || props.details.userRole === 'ADMIN'">
          <Icon name="edit" /> Edit Pool
        </DropdownMenuItem>
        <DropdownMenuItem v-if="props.details.userRole === 'OWNER'" variant="destructive" @click="handleDeleteClick">
          <Icon name="trash" /> Delete Pool
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuGroup v-if="props.details.userRole !== 'OWNER'">
        <DropdownMenuLabel><Label class="text-muted-foreground">Actions</Label></DropdownMenuLabel>
        <Separator />

        <DropdownMenuItem variant="destructive"> <Icon name="trash" /> Leave Pool </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

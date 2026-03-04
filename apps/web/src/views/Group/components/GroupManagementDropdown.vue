<script setup lang="ts">
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import { useGroupDelete, useGroupLeave } from "@/lib/queries/groups/group-mutations";
import AlertModal from "@/modals/alertModal.vue";
import { useModalStore } from "@/stores/modal";
import type { GroupDetails } from "@repo/validation";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

interface GroupManagementDropdownProps {
  details: GroupDetails | undefined;
}

const router = useRouter();
const modalStore = useModalStore();
const props = defineProps<GroupManagementDropdownProps>();
const isDeleteModalOpen = ref(false);
const isLeaveModalOpen = ref(false);

const canManageGroup = computed(() => {
  return props.details?.userRole === "OWNER" || props.details?.userRole === "ADMIN";
});
const canDeleteGroup = computed(() => {
  return props.details?.userRole === "OWNER";
});
const canLeaveGroup = computed(() => {
  return props.details?.userRole !== "OWNER";
});

const { mutateAsync: deleteGroup } = useGroupDelete();
const { mutateAsync: leaveGroup } = useGroupLeave();

function handleDeleteGroup() {
  if (!props.details) return;
  const groupId = props.details.id;

  deleteGroup(groupId, {
    onSuccess: () => {
      toast.success("Group deleted successfully.");
      router.push("/dashboard");
    },
  });
}

function handleLeaveGroup() {
  if (!props.details) return;
  const groupId = props.details.id;

  leaveGroup(groupId, {
    onSuccess: () => {
      toast.success("You have left the group successfully.");
      router.push("/dashboard");
    },
  });
}

function handleEditGroup() {
  if (!props.details) return;
  const groupId = props.details.id;

  modalStore.onOpen("group", groupId);
}
</script>

<template>
  <ResponsiveDropdown
    :items="[
      {
        label: 'Edit Group',
        icon: 'edit',
        action: handleEditGroup,
        hidden: !canManageGroup,
      },
      {
        label: 'Delete Group',
        icon: 'trash',
        action: () => (isDeleteModalOpen = true),
        hidden: !canDeleteGroup,
      },
      {
        label: 'Leave Group',
        icon: 'logout',
        action: () => (isLeaveModalOpen = true),
        hidden: !canLeaveGroup,
      },
    ]"
  >
    <template #header>
      <div>
        <h1>{{ props.details?.name }}</h1>
        <p class="text-muted-foreground text-sm">{{ props.details?.description }}</p>
      </div>
    </template>
  </ResponsiveDropdown>

  <AlertModal
    v-on:action="handleDeleteGroup"
    v-model:open="isDeleteModalOpen"
    title="Group Deletion"
    action-label="Delete"
    action-class="destructive"
  >
    <template #description>
      <p>
        Are you sure you want to delete the following group: <strong>{{ props.details?.name }}</strong>
      </p>

      <p class="">This action cannot be undone.</p>
    </template>
  </AlertModal>

  <AlertModal
    v-on:action="handleLeaveGroup"
    v-model:open="isLeaveModalOpen"
    title="Leave Group"
    action-label="Leave"
    action-class="destructive"
  >
    <template #description>
      <p>
        Are you sure you want to leave the following group: <strong>{{ props.details?.name }}</strong>
      </p>

      <p class="">You will lose access to shared resources in this group.</p>
    </template>
  </AlertModal>
</template>

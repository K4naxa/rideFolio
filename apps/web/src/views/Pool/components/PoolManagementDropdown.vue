<script setup lang="ts">
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import { usePoolDelete, usePoolLeave } from "@/lib/queries/pools/pool-mutations";
import AlertModal from "@/modals/alertModal.vue";
import { useModalStore } from "@/stores/modal";
import type { PoolDetails } from "@repo/validation";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

interface PoolManagementDropdownProps {
  details: PoolDetails | undefined;
}

const router = useRouter();
const modalStore = useModalStore();
const props = defineProps<PoolManagementDropdownProps>();
const isDeleteModalOpen = ref(false);
const isLeaveModalOpen = ref(false);

const canManagePool = computed(() => {
  return props.details?.userRole === "OWNER" || props.details?.userRole === "ADMIN";
});
const canDeletePool = computed(() => {
  return props.details?.userRole === "OWNER";
});
const canLeavePool = computed(() => {
  return props.details?.userRole !== "OWNER";
});

const { mutateAsync: deletePool } = usePoolDelete();
const { mutateAsync: leavePool } = usePoolLeave();

function handleDeletePool() {
  if (!props.details) return;
  const poolId = props.details.id;

  deletePool(poolId, {
    onSuccess: () => {
      toast.success("Pool deleted successfully.");
      router.push("/dashboard");
    },
  });
}

function handleLeavePool() {
  if (!props.details) return;
  const poolId = props.details.id;

  leavePool(poolId, {
    onSuccess: () => {
      toast.success("You have left the pool successfully.");
      router.push("/dashboard");
    },
  });
}

function handleEditPool() {
  if (!props.details) return;
  const poolId = props.details.id;

  modalStore.onOpen("pool", poolId);
}
</script>

<template>
  <ResponsiveDropdown
    :items="[
      {
        label: 'Edit Group',
        icon: 'edit',
        action: handleEditPool,
        hidden: !canManagePool,
      },
      {
        label: 'Delete Group',
        icon: 'trash',
        action: () => (isDeleteModalOpen = true),
        hidden: !canDeletePool,
      },
      {
        label: 'Leave Group',
        icon: 'logout',
        action: () => (isLeaveModalOpen = true),
        hidden: !canLeavePool,
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
    v-on:action="handleDeletePool"
    v-model:open="isDeleteModalOpen"
    title="Pool Deletion"
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
    v-on:action="handleLeavePool"
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

<script setup lang="ts">
import { useCurrentPool } from "@/lib/composables/useCurrentPool";
import { usePoolDetails } from "@/lib/queries/pools/pool-queries";
import { computed, ref } from "vue";
import PoolManagementDropdown from "./components/PoolManagementDropdown.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon from "@/components/icons/Icon.vue";
import {
  getPoolInviteStateNameKey,
  getPoolMemberRoleNameKey,
  POOL_MEMBER_ROLES,
  type PoolMember,
  type PoolMemberRoleCode,
} from "@repo/validation";
import Button from "@/components/ui/button/Button.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";

import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import { getInitials } from "@/lib/utils";
import Badge from "@/components/ui/badge/Badge.vue";

import { toast } from "vue-sonner";
import PoolErrorState from "./components/PoolErrorState.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import AlertModal from "@/modals/alertModal.vue";
import {
  usePoolInviteCancel,
  usePoolMemberRemove,
  usePoolRemoveVehicle,
  usePoolUpdateUserRole,
} from "@/lib/queries/pools/pool-mutations";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";

import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { PlusIcon } from "lucide-vue-next";

import PoolAddVehicleForm from "./components/PoolAddVehicleForm.vue";
import PoolSendInviteModal from "./components/PoolSendInviteModal.vue";
import Label from "@/components/ui/label/Label.vue";
import { useTimeAgoIntl } from "@vueuse/core";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";

const { currentPoolId } = useCurrentPool();
const { mutateAsync: cancelPoolInvite } = usePoolInviteCancel();
const { mutateAsync: updateRole } = usePoolUpdateUserRole();
const { mutateAsync: removeVehicleFromPool } = usePoolRemoveVehicle();
const { mutateAsync: removeMemberFromPool } = usePoolMemberRemove();
const { data, isLoading, isError } = usePoolDetails(computed(() => currentPoolId.value));

const canManagePool = computed(() => {
  if (!data.value) return false;
  return ["OWNER", "ADMIN"].includes(data.value.userRole);
});

const showInviteModal = ref(false);

const showRoleUpdateAlert = ref(false);
const pendingRoleUpdate = ref<{ userId: string; role: PoolMemberRoleCode } | null>(null);

const showAddVehicleModal = ref(false);
const showRemoveVehicleAlert = ref(false);
const pendingVehicleRemoval = ref<{ poolId: string; vehicleId: string } | null>(null);

const showRemoveMemberAlert = ref(false);
const pendingMemberRemoval = ref<{ member: PoolMember; poolId: string } | null>(null);

function handleUpdateRoleClick(userId: string, role: PoolMemberRoleCode) {
  if (role === "OWNER") {
    pendingRoleUpdate.value = { userId, role };
    showRoleUpdateAlert.value = true;
  } else {
    handleRoleUpdate(userId, role);
  }
}

async function handleRoleUpdate(userId: string, role: PoolMemberRoleCode) {
  if (!currentPoolId.value) return;
  await updateRole(
    {
      poolId: currentPoolId.value,
      userId,
      role,
    },
    {
      onSuccess: () => {
        toast.success("user role updated successfully.");
      },
      onError: () => {
        toast.error("Failed to update user role.");
      },
    },
  );
}

async function handleRemoveVehicle() {
  if (pendingVehicleRemoval.value) {
    await removeVehicleFromPool(
      { poolId: pendingVehicleRemoval.value.poolId, vehicleId: pendingVehicleRemoval.value.vehicleId },
      {
        onSuccess: () => {
          toast.success("Vehicle removed from the pool.");
        },
        onError: () => {
          toast.error("Failed to remove vehicle from the pool. Please try again.");
        },
      },
    );
  }
  pendingVehicleRemoval.value = null;
}

async function handleRemoveMember() {
  if (pendingMemberRemoval.value) {
    await removeMemberFromPool(
      { poolId: pendingMemberRemoval.value.poolId, userId: pendingMemberRemoval.value.member.user.id },
      {
        onSuccess: () => {
          toast.success("Member removed from the pool.");
        },
        onError: () => {
          toast.error("Failed to remove member from the pool. Please try again.");
        },
      },
    );
  }
  pendingMemberRemoval.value = null;
}
</script>

<template lang="html">
  <MainContentWrapper class="py-8">
    <!-- Error State -->
    <PoolErrorState v-if="isError" />

    <!-- Main Content -->
    <div v-else-if="data" class="gaps-md flex w-full flex-col">
      <header class="">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold tracking-tight">{{ data.name }}</h1>
          <div class="flex items-center gap-8">
            <Badge variant="secondary" class="">
              {{ getPoolMemberRoleNameKey(data.userRole) }}
            </Badge>

            <PoolManagementDropdown v-if="!isLoading && !isError" :details="data" />
          </div>
        </div>
        <CardDescription class="text-base">{{ data.description }}</CardDescription>
      </header>

      <div class="gaps-lg flex flex-col">
        <!-- Members -->
        <section v-if="data?.type === 'SHARED'">
          <div class="mb-1 flex items-end justify-between gap-4">
            <h3 class="flex items-center gap-2.5"><Icon name="users" /> Members</h3>
            <Button v-if="canManagePool" variant="outline" @click="showInviteModal = true">
              <Icon name="userPlus" class="mr-2" />
              Invite Member
            </Button>
          </div>
          <!-- Users table -->
          <ScrollableNav>
            <ul class="card flex w-full min-w-fit flex-col divide-y overflow-hidden">
              <header
                :class="[
                  canManagePool
                    ? 'grid-cols-[2rem_minmax(15rem,1fr)_6rem_8rem_3rem]'
                    : 'grid-cols-[2rem_minmax(12rem,1fr)_8rem]',
                ]"
                class="bg-table-header-background text-table-header-foreground gaps-md grid min-w-fit px-2.5 py-1"
              >
                <!-- empty header for avatar column -->
                <div />
                <Label class="py-1 text-sm">User</Label>
                <Label v-if="canManagePool" class="py-1 text-sm">Joined</Label>
                <Label class="py-1 text-sm">Role</Label>
                <!-- empty header for actions column -->
                <div v-if="canManagePool" class="w-6" />
              </header>
              <li
                v-for="member in data?.members"
                :key="member.user.id"
                class="listHover gaps-md grid min-w-fit items-center px-2.5 py-2.5"
                :class="[
                  canManagePool
                    ? 'grid-cols-[2rem_minmax(15rem,1fr)_6rem_8rem_3rem]'
                    : 'grid-cols-[2rem_minmax(12rem,1fr)_8rem]',
                ]"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                  <AvatarFallback class="rounded-lg text-center text-sm">
                    {{ getInitials(member.user.name) }}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p class="">{{ member.user.name }}</p>
                  <p v-if="member.user.email" class="text-muted-foreground text-sm">{{ member.user.email }}</p>
                </div>

                <span v-if="canManagePool" class="text-muted-foreground text-sm">
                  {{ useTimeAgoIntl(member.createdAt) }}
                </span>

                <div class="w-32">
                  <ResponsiveSelect
                    v-if="canManagePool"
                    title="Member role"
                    description="User role in the pool, determines permissions"
                    trigger-class="text-sm w-full "
                    :disabled="member.role === 'OWNER'"
                    :options="
                      Object.values(POOL_MEMBER_ROLES)
                        .filter((role) => role.code !== 'OWNER' || data?.userRole === 'OWNER')
                        .map((role) => ({
                          label: role.label,
                          value: role.code,
                        }))
                    "
                    :modelValue="member.role"
                    @select="(value) => handleUpdateRoleClick(member.user.id, value as PoolMemberRoleCode)"
                    placeholder="Role"
                  >
                  </ResponsiveSelect>

                  <span v-else class="text-muted-foreground text-sm">
                    {{ getPoolMemberRoleNameKey(member.role) }}
                  </span>
                </div>

                <div v-if="canManagePool && member.role !== 'OWNER'">
                  <ResponsiveDropdown
                    title="Member actions"
                    description="Manage member"
                    :items="[
                      {
                        label: 'Remove Member',
                        icon: 'logout',
                        action: () => {
                          if (!data) return;
                          showRemoveMemberAlert = true;
                          pendingMemberRemoval = { member, poolId: data.id };
                        },
                      },
                    ]"
                  >
                    <template #trigger>
                      <Button variant="ghost" size="sm"><Icon name="dotsVertical" /></Button>
                    </template>
                    <template #header>
                      <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar class="h-8 w-8 rounded-lg">
                          <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                          <AvatarFallback class="bg-accent rounded-lg">
                            {{ getInitials(member?.user?.name) }}
                          </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                          <span class="truncate font-medium">{{ member?.user?.name }}</span>
                          <span class="text-muted-foreground truncate text-xs"> {{ member?.user?.email }} </span>
                        </div>
                      </div>
                    </template>
                  </ResponsiveDropdown>
                </div>
              </li>

              <!-- Member Invites -->
              <li
                v-for="invite in data?.invites"
                :key="invite.id"
                class="listHover gaps-md grid min-w-fit grid-cols-[2rem_minmax(15rem,1fr)_6rem_8rem_3rem] items-center px-2.5 py-2.5"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarFallback class="rounded-lg">{{ getInitials(invite.email) }}</AvatarFallback>
                </Avatar>

                <p class="text-muted-foreground text-sm">{{ invite.email }}</p>

                <Badge class="px-3 text-sm" variant="muted">{{ getPoolInviteStateNameKey(invite.state) }}... </Badge>

                <div class="w-32">
                  <Select v-if="canManagePool" disabled>
                    <SelectTrigger class="w-full">
                      <SelectValue class="text-sm" :placeholder="getPoolMemberRoleNameKey(invite.roleToGrant)" />
                    </SelectTrigger>
                  </Select>
                  <Badge v-else variant="outline" class="text-sm">
                    {{ getPoolMemberRoleNameKey(invite.roleToGrant) }}
                  </Badge>
                </div>

                <div v-if="canManagePool">
                  <ResponsiveDropdown
                    title="Member actions"
                    description="Manage member"
                    :items="[
                      {
                        label: 'Cancel Invite',
                        icon: 'close',
                        action: () => cancelPoolInvite(invite.id),
                      },
                    ]"
                  >
                    <template #trigger>
                      <Button variant="ghost" size="sm"><Icon name="dotsVertical" /></Button>
                    </template>
                  </ResponsiveDropdown>
                </div>
              </li>
            </ul>
          </ScrollableNav>
        </section>

        <!-- Vehicles -->
        <div class="space-y-2">
          <div class="flex items-end">
            <h3 class="flex items-center gap-2.5"><Icon name="carFront" /> Vehicles</h3>
            <Button
              v-if="canManagePool || data?.rules.membersCanAddVehicles"
              variant="outline"
              class="ml-auto"
              size="sm"
              type="button"
              @click="showAddVehicleModal = true"
            >
              <PlusIcon class="mr-2" />
              Add Vehicle
            </Button>
          </div>
          <Separator />

          <!-- Vehicle list -->

          <div class="">
            <ul class="scrollbar-thin overflow-x-auto">
              <li
                v-for="vehicle in data?.vehicles"
                :key="vehicle.data.id"
                class="group listHover flex items-center justify-between gap-4 rounded py-2.5 md:p-4"
              >
                <VehicleItem :vehicle="vehicle.data" variant="small" />

                <Button
                  class="opacity-100 transition-opacity duration-150 group-hover:opacity-100 md:opacity-0"
                  v-if="canManagePool || data?.rules.membersCanAddVehicles"
                  variant="outline"
                  size="sm"
                  @click="
                    showRemoveVehicleAlert = true;
                    pendingVehicleRemoval = { poolId: data.id, vehicleId: vehicle.data.id };
                  "
                >
                  <Icon name="trash" />
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </MainContentWrapper>

  <AlertModal
    title="Transfer group ownership"
    action-label="Transfer Ownership"
    action-variant="secondary"
    v-model:open="showRoleUpdateAlert"
    v-on:action="
      () => {
        if (pendingRoleUpdate) {
          handleRoleUpdate(pendingRoleUpdate.userId, pendingRoleUpdate.role);
        }
        pendingRoleUpdate = null;
      }
    "
    description="Are you sure you want to transfer ownership of this group? You will lose your admin privileges and the new owner will have full control over the group"
  />

  <AlertModal
    title="Remove Member"
    action-label="Remove Member"
    action-variant="destructive"
    v-model:open="showRemoveMemberAlert"
    v-on:action="handleRemoveMember"
  >
    <template #description>
      <div class="gaps-md flex flex-col">
        <divs class="space-y-2">
          <p>You are about to remove the following member:</p>
          <div class="flex items-center gap-2 rounded border px-1 py-1.5 text-left text-sm">
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage
                :src="pendingMemberRemoval?.member.user.image ?? ''"
                :alt="pendingMemberRemoval?.member.user.name ?? 'user'"
              />
              <AvatarFallback class="bg-accent rounded-lg">
                {{ getInitials(pendingMemberRemoval?.member.user.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ pendingMemberRemoval?.member.user.name }}</span>
              <span class="text-muted-foreground truncate text-xs">
                {{ pendingMemberRemoval?.member.user.email }}
              </span>
            </div>
          </div>
        </divs>

        <div
          v-if="data?.vehicles.some((vehicle) => vehicle.owner.id === pendingMemberRemoval?.member.user.id)"
          class="space-y-2"
        >
          <p>Removing the member will also remove their vehicles:</p>
          <ul class="max-h-48 space-y-2 overflow-y-auto rounded border">
            <div
              v-for="vehicle in data?.vehicles.filter(
                (vehicle) => vehicle.owner.id === pendingMemberRemoval?.member.user.id,
              )"
              :key="vehicle.data.id"
            >
              <VehicleItem :vehicle="vehicle.data" variant="small" />
            </div>
          </ul>
        </div>
      </div>
    </template>
  </AlertModal>

  <AlertModal
    title="Remove Vehicle"
    action-label="Remove Vehicle"
    action-variant="destructive"
    v-model:open="showRemoveVehicleAlert"
    v-on:action="handleRemoveVehicle"
    description="Are you sure you want to remove this vehicle from the pool?"
  />

  <!-- Invite Modal -->
  <PoolSendInviteModal v-if="data" v-model:open="showInviteModal" :pool="data" />

  <!-- Add vehicles form -->
  <PoolAddVehicleForm v-if="data" v-model:open="showAddVehicleModal" :pool="data" />
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

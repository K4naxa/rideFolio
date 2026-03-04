<script setup lang="ts">
import { useCurrentGroup } from "@/lib/composables/useCurrentGroup";
import { useGroupDetails } from "@/lib/queries/groups/group-queries";
import { computed, ref } from "vue";
import GroupManagementDropdown from "./components/GroupManagementDropdown.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon from "@/components/icons/Icon.vue";
import {
  getGroupInviteStateNameKey,
  getGroupMemberRoleNameKey,
  GROUP_MEMBER_ROLES,
  type GroupMember,
  type GroupMemberRoleCode,
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
import GroupErrorState from "./components/GroupErrorState.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import AlertModal from "@/modals/alertModal.vue";
import {
  useGroupInviteCancel,
  useGroupMemberRemove,
  useGroupRemoveVehicle,
  useGroupUpdateUserRole,
} from "@/lib/queries/groups/group-mutations";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";

import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { PlusIcon } from "lucide-vue-next";

import GroupAddVehicleForm from "./components/GroupAddVehicleForm.vue";
import GroupSendInviteModal from "./components/GroupSendInviteModal.vue";
import Label from "@/components/ui/label/Label.vue";
import { useTimeAgoIntl } from "@vueuse/core";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";

const { currentGroupId } = useCurrentGroup();
const { mutateAsync: cancelGroupInvite } = useGroupInviteCancel();
const { mutateAsync: updateRole } = useGroupUpdateUserRole();
const { mutateAsync: removeVehicleFromGroup } = useGroupRemoveVehicle();
const { mutateAsync: removeMemberFromGroup } = useGroupMemberRemove();
const { data, isLoading, isError } = useGroupDetails(computed(() => currentGroupId.value));

const canManageGroup = computed(() => {
  if (!data.value) return false;
  return ["OWNER", "ADMIN"].includes(data.value.userRole);
});

const showInviteModal = ref(false);

const showRoleUpdateAlert = ref(false);
const pendingRoleUpdate = ref<{ userId: string; role: GroupMemberRoleCode } | null>(null);

const showAddVehicleModal = ref(false);
const showRemoveVehicleAlert = ref(false);
const pendingVehicleRemoval = ref<{ groupId: string; vehicleId: string } | null>(null);

const showRemoveMemberAlert = ref(false);
const pendingMemberRemoval = ref<{ member: GroupMember; groupId: string } | null>(null);

function handleUpdateRoleClick(userId: string, role: GroupMemberRoleCode) {
  if (role === "OWNER") {
    pendingRoleUpdate.value = { userId, role };
    showRoleUpdateAlert.value = true;
  } else {
    handleRoleUpdate(userId, role);
  }
}

async function handleRoleUpdate(userId: string, role: GroupMemberRoleCode) {
  if (!currentGroupId.value) return;
  await updateRole(
    {
      groupId: currentGroupId.value,
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
    await removeVehicleFromGroup(
      { groupId: pendingVehicleRemoval.value.groupId, vehicleId: pendingVehicleRemoval.value.vehicleId },
      {
        onSuccess: () => {
          toast.success("Vehicle removed from the group.");
        },
        onError: () => {
          toast.error("Failed to remove vehicle from the group. Please try again.");
        },
      },
    );
  }
  pendingVehicleRemoval.value = null;
}

async function handleRemoveMember() {
  if (pendingMemberRemoval.value) {
    await removeMemberFromGroup(
      { groupId: pendingMemberRemoval.value.groupId, userId: pendingMemberRemoval.value.member.user.id },
      {
        onSuccess: () => {
          toast.success("Member removed from the group.");
        },
        onError: () => {
          toast.error("Failed to remove member from the group. Please try again.");
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
    <GroupErrorState v-if="isError" />

    <!-- Main Content -->
    <div v-else-if="data" class="gaps-md flex w-full flex-col">
      <header class="">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold tracking-tight">{{ data.name }}</h1>
          <div class="flex items-center gap-8">
            <Badge variant="secondary" class="">
              {{ getGroupMemberRoleNameKey(data.userRole) }}
            </Badge>

            <GroupManagementDropdown v-if="!isLoading && !isError" :details="data" />
          </div>
        </div>
        <CardDescription class="text-base">{{ data.description }}</CardDescription>
      </header>

      <div class="gaps-lg flex flex-col">
        <!-- Members -->
        <div class="mb-1 flex items-end justify-between gap-4">
          <h3 class="flex items-center gap-2.5"><Icon name="users" /> Members</h3>
          <Button v-if="canManageGroup" variant="outline" @click="showInviteModal = true">
            <Icon name="userPlus" class="mr-2" />
            Invite Member
          </Button>
        </div>
        <!-- Users table -->
        <ScrollableNav>
          <ul class="card flex w-full min-w-fit flex-col divide-y overflow-hidden">
            <li
              :class="[
                canManageGroup
                  ? 'grid-cols-[2rem_minmax(15rem,1fr)_6rem_8rem_3rem]'
                  : 'grid-cols-[2rem_minmax(12rem,1fr)_8rem]',
              ]"
              class="bg-table-header-background text-table-header-foreground gaps-md grid min-w-fit px-2.5 py-1"
            >
              <!-- empty header for avatar column -->
              <div />
              <Label class="py-1 text-sm">User</Label>
              <Label v-if="canManageGroup" class="py-1 text-sm">Joined</Label>
              <Label class="py-1 text-sm">Role</Label>
              <!-- empty header for actions column -->
              <div v-if="canManageGroup" class="w-6" />
            </li>
            <li
              v-for="member in data?.members"
              :key="member.user.id"
              class="listHover gaps-md grid min-w-fit items-center px-2.5 py-2.5"
              :class="[
                canManageGroup
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

              <span v-if="canManageGroup" class="text-muted-foreground text-sm">
                {{ useTimeAgoIntl(member.createdAt) }}
              </span>

              <div class="w-32">
                <ResponsiveSelect
                  v-if="canManageGroup"
                  title="Member role"
                  description="User role in the group, determines permissions"
                  trigger-class="text-sm w-full "
                  :disabled="member.role === 'OWNER'"
                  :options="
                    Object.values(GROUP_MEMBER_ROLES)
                      .filter((role) => role.code !== 'OWNER' || data?.userRole === 'OWNER')
                      .map((role) => ({
                        label: role.label,
                        value: role.code,
                      }))
                  "
                  :modelValue="member.role"
                  @select="(value) => handleUpdateRoleClick(member.user.id, value as GroupMemberRoleCode)"
                  placeholder="Role"
                >
                </ResponsiveSelect>

                <span v-else class="text-muted-foreground text-sm">
                  {{ getGroupMemberRoleNameKey(member.role) }}
                </span>
              </div>

              <div v-if="canManageGroup && member.role !== 'OWNER'">
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
                        pendingMemberRemoval = { member, groupId: data.id };
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

              <Badge class="px-3 text-sm" variant="muted">{{ getGroupInviteStateNameKey(invite.state) }}... </Badge>

              <div class="w-32">
                <Select v-if="canManageGroup" disabled>
                  <SelectTrigger class="w-full">
                    <SelectValue class="text-sm" :placeholder="getGroupMemberRoleNameKey(invite.roleToGrant)" />
                  </SelectTrigger>
                </Select>
                <Badge v-else variant="outline" class="text-sm">
                  {{ getGroupMemberRoleNameKey(invite.roleToGrant) }}
                </Badge>
              </div>

              <div v-if="canManageGroup">
                <ResponsiveDropdown
                  title="Member actions"
                  description="Manage member"
                  :items="[
                    {
                      label: 'Cancel Invite',
                      icon: 'close',
                      action: () => cancelGroupInvite(invite.id),
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

        <!-- Vehicles -->
        <div class="space-y-2">
          <div class="flex items-end">
            <h3 class="flex items-center gap-2.5"><Icon name="carFront" /> Vehicles</h3>
            <Button
              v-if="canManageGroup || data?.rules.membersCanAddVehicles"
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
                  v-if="canManageGroup || data?.rules.membersCanAddVehicles"
                  variant="outline"
                  size="sm"
                  @click="
                    showRemoveVehicleAlert = true;
                    pendingVehicleRemoval = { groupId: data.id, vehicleId: vehicle.data.id };
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
        <div class="space-y-2">
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
        </div>

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
    description="Are you sure you want to remove this vehicle from the group?"
  />

  <!-- Invite Modal -->
  <GroupSendInviteModal v-if="data" v-model:open="showInviteModal" :group="data" />

  <!-- Add vehicles form -->
  <GroupAddVehicleForm v-if="data" v-model:open="showAddVehicleModal" :group="data" />
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

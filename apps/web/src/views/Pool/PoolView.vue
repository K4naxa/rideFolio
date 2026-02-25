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
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";

import { toast } from "vue-sonner";
import PoolErrorState from "./components/PoolErrorState.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import AlertModal from "@/modals/alertModal.vue";
import { usePoolInviteCancel, usePoolUpdateUserRole } from "@/lib/queries/pools/pool-mutations";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";

import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { PlusIcon } from "lucide-vue-next";

import PoolAddVehicleForm from "./components/PoolAddVehicleForm.vue";
import PoolSendInviteModal from "./components/PoolSendInviteModal.vue";

const { currentUser } = useCurrentUser();
const { currentPoolId } = useCurrentPool();
const { mutateAsync: cancelPoolInvite } = usePoolInviteCancel();
const { mutateAsync: updateRole } = usePoolUpdateUserRole();
const { data, isLoading, isError } = usePoolDetails(computed(() => currentPoolId.value));

const canManagePool = computed(() => {
  if (!data.value) return false;
  return ["OWNER", "ADMIN"].includes(data.value.userRole);
});

const showInviteModal = ref(false);

const showRoleUpdateAlert = ref(false);
const pendingRoleUpdate = ref<{ userId: string; role: PoolMemberRoleCode } | null>(null);

const showAddVehicleModal = ref(false);

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
          <div class="flex items-end justify-between gap-4">
            <h3 class="flex items-center gap-2.5"><Icon name="users" /> Members</h3>
            <Button v-if="canManagePool" variant="outline" @click="showInviteModal = true">
              <Icon name="userPlus" class="mr-2" />
              Invite Member
            </Button>
          </div>
          <Separator class="my-2" />
          <!-- Users table -->
          <ul class="divide-y">
            <li
              v-for="member in data?.members"
              :key="member.user.id"
              class="listHover grid items-center gap-4 p-2.5 lg:gap-6"
              :class="[canManagePool ? 'grid-cols-[auto_1fr_auto_auto]' : 'grid-cols-[auto_1fr_auto]']"
            >
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                <AvatarFallback class="rounded-lg text-center text-sm">
                  {{ getInitials(member.user.name) }}
                </AvatarFallback>
              </Avatar>

              <div>
                <p class="leading-tight font-semibold">{{ member.user.name }}</p>
                <p class="text-muted-foreground text-sm">{{ member.user.email }}</p>
              </div>
              <div>
                <ResponsiveSelect
                  v-if="canManagePool"
                  title="Member role"
                  description="User role in the pool, determines permissions"
                  trigger-class="text-sm medium w-32"
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

                <Badge v-else variant="outline" class="text-base">
                  {{ getPoolMemberRoleNameKey(member.role) }}
                </Badge>
              </div>

              <div class="w-6">
                <DropdownMenu v-if="member.role !== 'OWNER' && canManagePool">
                  <DropdownMenuTrigger>
                    <Icon name="dotsHorizontal" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                    <Separator />
                    <DropdownMenuItem
                      variant="destructive"
                      :disabled="data.userRole === 'OWNER' && member.user.id === currentUser?.id"
                    >
                      <Icon name="logout" /> Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>

            <!-- Member Invites -->
            <li
              v-for="invite in data?.invites"
              :key="invite.id"
              class="listHover grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-8 p-4"
            >
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarFallback class="rounded-lg">{{ getInitials(invite.email) }}</AvatarFallback>
              </Avatar>

              <div>
                <p class="text-muted-foreground text-sm">{{ invite.email }}</p>
              </div>

              <Badge class="px-3 text-base" variant="muted">{{ getPoolInviteStateNameKey(invite.state) }} </Badge>

              <div>
                <Select v-if="canManagePool" disabled>
                  <SelectTrigger>
                    <SelectValue class="text-sm" :placeholder="getPoolMemberRoleNameKey(invite.roleToGrant)" />
                  </SelectTrigger>
                </Select>
                <Badge v-else variant="outline" class="text-sm">
                  {{ getPoolMemberRoleNameKey(invite.roleToGrant) }}
                </Badge>
              </div>

              <DropdownMenu v-if="canManagePool">
                <DropdownMenuTrigger>
                  <Icon name="dotsHorizontal" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="cancelPoolInvite(invite.id)">
                    <Icon name="close" /> Cancel Invite
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
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
                class="listHover flex items-center justify-between gap-4 rounded p-2.5 md:p-4"
              >
                <VehicleItem :vehicle="vehicle.data" />

                <ResponsiveDropdown
                  v-if="canManagePool || vehicle.isCurrentUserOwner"
                  :items="[
                    {
                      label: 'Remove vehicle',
                      icon: 'logout',
                      disabled: true,
                      action: () => console.log('removed vehicle ', vehicle.data.name),
                    },
                  ]"
                >
                </ResponsiveDropdown>
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
    action-class="destructive"
    :open="showRoleUpdateAlert"
    @update:open="(val) => (showRoleUpdateAlert = val)"
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

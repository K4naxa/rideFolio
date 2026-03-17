<script setup lang="ts">
import { useCurrentGroup } from "@/lib/composables/useCurrentGroup";
import { useGroupDetails } from "@/lib/queries/groups/group-queries";
import { computed, ref } from "vue";
import GroupManagementDropdown from "./components/GroupManagementDropdown.vue";
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
import { capitalize, getInitials } from "@/lib/utils";
import Badge from "@/components/ui/badge/Badge.vue";

import { toast } from "vue-sonner";
import GroupErrorState from "./components/GroupErrorState.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
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
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const isMobile = useIsMobile();

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
  <MainContentWrapper class="lg:pt-20">
    <template #mobile-header>
      <MobilePageHeader class="justify-between">
        <span class="text-lg font-medium"> {{ data?.name }} </span>
        <GroupManagementDropdown v-if="!isLoading && !isError" :details="data" />
      </MobilePageHeader>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center py-20">
      <Spinner class="text-muted-foreground size-8" />
    </div>

    <!-- Error State -->
    <GroupErrorState v-else-if="isError" />

    <!-- Main Content -->
    <div v-else-if="data" class="gaps-md flex w-full flex-col">
      <!-- Page header (desktop only) -->
      <header class="mb-4 hidden justify-between gap-4 md:flex">
        <div>
          <h1>{{ data.name }}</h1>
          <CardDescription v-if="data.description">{{ data.description }}</CardDescription>
        </div>
        <div class="flex items-center gap-4">
          <Badge variant="secondary">
            {{ getGroupMemberRoleNameKey(data.userRole) }}
          </Badge>
          <GroupManagementDropdown :details="data" />
        </div>
      </header>

      <!-- Mobile: description below header -->
      <CardDescription v-if="data.description" class="md:hidden">{{ data.description }}</CardDescription>

      <div class="gaps-lg flex flex-col">
        <!-- ── Members ──────────────────────────────────────────── -->
        <section>
          <div class="mb-3 flex items-center justify-between gap-4">
            <h2 class="flex items-center gap-2"><Icon name="users" /> Members</h2>
            <Button v-if="canManageGroup" variant="outline" size="sm" @click="showInviteModal = true">
              <Icon name="userPlus" class="mr-1.5" />
              Invite
            </Button>
          </div>

          <!-- ── Mobile: stacked member cards ── -->
          <ul v-if="isMobile" class="gaps-sm flex flex-col">
            <!-- Active members -->
            <li v-for="member in data?.members" :key="member.user.id" class="card gaps-sm flex flex-col px-4 py-3">
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 shrink-0 rounded-lg">
                  <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                  <AvatarFallback class="rounded-lg text-sm">
                    {{ getInitials(member.user.name) }}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">{{ member.user.name }}</p>
                  <p v-if="member.user.email" class="text-muted-foreground truncate text-xs">{{ member.user.email }}</p>
                </div>

                <!-- Mobile member actions -->
                <div v-if="canManageGroup && member.role !== 'OWNER'">
                  <Drawer v-slot="{ onOpenChange }">
                    <DrawerTrigger asChild>
                      <Button variant="ghost">
                        <Icon name="dotsVertical" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <template #floatingItem>
                        <div class="card flex flex-col gap-4 p-3">
                          <div class="flex items-center gap-3">
                            <Avatar class="h-9 w-9 shrink-0 rounded-lg">
                              <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                              <AvatarFallback class="rounded-lg text-sm">
                                {{ getInitials(member.user.name) }}
                              </AvatarFallback>
                            </Avatar>

                            <div class="min-w-0 flex-1">
                              <p class="truncate font-medium">{{ member.user.name }}</p>
                              <p v-if="member.user.email" class="text-muted-foreground truncate text-xs">
                                {{ member.user.email }}
                              </p>
                            </div>
                          </div>

                          <div class="flex items-center gap-2 text-sm">
                            <span class="text-muted-foreground text-sm font-medium">Joined:</span>
                            {{
                              new Date(member.createdAt).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            }}
                          </div>
                        </div>
                      </template>
                      <DrawerHeader> <DrawerTitle> Member actions </DrawerTitle></DrawerHeader>
                      <div>
                        <Drawer v-slot="{ onOpenChange: onRoleDrawerOpenChange }">
                          <DrawerTrigger asChild>
                            <Button variant="menu" class="justify-between">
                              <span class="flex items-center gap-2.5"><Icon name="user" /> Update role</span>
                              <span class="text-sm">{{ capitalize(member.role) }}</span>
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle> Update role </DrawerTitle>
                              <DrawerDescription> Update the role of the member. </DrawerDescription>
                            </DrawerHeader>
                            <div>
                              <Button
                                v-for="role in Object.values(GROUP_MEMBER_ROLES).filter(
                                  (r) => r.code !== 'OWNER' || data?.userRole === 'OWNER',
                                )"
                                :key="role.code"
                                variant="menu"
                                class="justify-between"
                                @click="
                                  handleUpdateRoleClick(member.user.id, role.code as GroupMemberRoleCode);
                                  onRoleDrawerOpenChange(false);
                                  onOpenChange(false);
                                "
                              >
                                {{ role.label }}
                                <Icon name="check" v-if="member.role === role.code" />
                              </Button>
                            </div>
                          </DrawerContent>
                        </Drawer>
                        <Button
                          variant="menu"
                          @click="
                            showRemoveMemberAlert = true;
                            pendingMemberRemoval = { member, groupId: data.id };
                            onOpenChange(false);
                          "
                        >
                          <Icon name="logout" /> Remove member
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            </li>

            <!-- Pending invites (mobile) -->
            <li v-for="invite in data?.invites" :key="invite.id" class="card gaps-sm flex flex-col px-4 py-3">
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 shrink-0 rounded-lg">
                  <AvatarFallback class="rounded-lg text-sm">{{ getInitials(invite.email) }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="text-muted-foreground truncate text-sm">{{ invite.email }}</p>
                </div>
                <div v-if="canManageGroup">
                  <ResponsiveDropdown
                    title="Invite actions"
                    description="Manage invite"
                    :items="[{ label: 'Cancel Invite', icon: 'close', action: () => cancelGroupInvite(invite.id) }]"
                  >
                    <template #trigger>
                      <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0"><Icon name="dotsVertical" /></Button>
                    </template>
                  </ResponsiveDropdown>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <Badge variant="secondary" class="text-xs">{{ getGroupMemberRoleNameKey(invite.roleToGrant) }}</Badge>
                <Badge variant="muted" class="text-xs">{{ getGroupInviteStateNameKey(invite.state) }}…</Badge>
              </div>
            </li>

            <li v-if="!data?.members?.length && !data?.invites?.length">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon name="users" />
                  </EmptyMedia>
                  <EmptyTitle>No members yet</EmptyTitle>
                  <EmptyDescription>Invite people to collaborate in this group.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </li>
          </ul>

          <!-- ── Desktop: table layout ── -->
          <ScrollableNav v-else>
            <ul class="card flex w-full min-w-fit flex-col divide-y overflow-hidden">
              <li
                :class="[
                  canManageGroup
                    ? 'grid-cols-[2rem_minmax(15rem,1fr)_7rem_9rem_3rem]'
                    : 'grid-cols-[2rem_minmax(12rem,1fr)_9rem]',
                ]"
                class="bg-table-header-background text-table-header-foreground gaps-md grid min-w-fit px-3 py-1.5"
              >
                <div />
                <Label class="py-1 text-sm">User</Label>
                <Label v-if="canManageGroup" class="py-1 text-sm">Joined</Label>
                <Label class="py-1 text-sm">Role</Label>
                <div v-if="canManageGroup" class="w-6" />
              </li>

              <!-- Members rows -->
              <li
                v-for="member in data?.members"
                :key="member.user.id"
                class="listHover gaps-md grid min-w-fit items-center px-3 py-2.5"
                :class="[
                  canManageGroup
                    ? 'grid-cols-[2rem_minmax(15rem,1fr)_7rem_9rem_3rem]'
                    : 'grid-cols-[2rem_minmax(12rem,1fr)_9rem]',
                ]"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                  <AvatarFallback class="rounded-lg text-center text-sm">
                    {{ getInitials(member.user.name) }}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p>{{ member.user.name }}</p>
                  <p v-if="member.user.email" class="text-muted-foreground text-sm">{{ member.user.email }}</p>
                </div>

                <span v-if="canManageGroup" class="text-muted-foreground text-sm">
                  {{ useTimeAgoIntl(member.createdAt) }}
                </span>

                <div class="w-36">
                  <ResponsiveSelect
                    v-if="canManageGroup"
                    title="Member role"
                    description="User role in the group, determines permissions"
                    trigger-class="text-sm w-full"
                    :disabled="member.role === 'OWNER'"
                    :options="
                      Object.values(GROUP_MEMBER_ROLES)
                        .filter((role) => role.code !== 'OWNER' || data?.userRole === 'OWNER')
                        .map((role) => ({ label: role.label, value: role.code }))
                    "
                    :modelValue="member.role"
                    @select="(value) => handleUpdateRoleClick(member.user.id, value as GroupMemberRoleCode)"
                    placeholder="Role"
                  />
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
                          <span class="text-muted-foreground truncate text-xs">{{ member?.user?.email }}</span>
                        </div>
                      </div>
                    </template>
                  </ResponsiveDropdown>
                </div>
              </li>

              <!-- Pending invite rows -->
              <li
                v-for="invite in data?.invites"
                :key="invite.id"
                class="listHover gaps-md grid min-w-fit grid-cols-[2rem_minmax(15rem,1fr)_7rem_9rem_3rem] items-center px-3 py-2.5"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarFallback class="rounded-lg">{{ getInitials(invite.email) }}</AvatarFallback>
                </Avatar>

                <p class="text-muted-foreground text-sm">{{ invite.email }}</p>

                <Badge class="w-fit px-2 text-xs" variant="muted"
                  >{{ getGroupInviteStateNameKey(invite.state) }}…</Badge
                >

                <div class="w-36">
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
                    title="Invite actions"
                    description="Manage invite"
                    :items="[{ label: 'Cancel Invite', icon: 'close', action: () => cancelGroupInvite(invite.id) }]"
                  >
                    <template #trigger>
                      <Button variant="ghost" size="sm"><Icon name="dotsVertical" /></Button>
                    </template>
                  </ResponsiveDropdown>
                </div>
              </li>

              <!-- Desktop empty state row -->
              <li v-if="!data?.members?.length && !data?.invites?.length">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Icon name="users" />
                    </EmptyMedia>
                    <EmptyTitle>No members yet</EmptyTitle>
                    <EmptyDescription>Invite people to collaborate in this group.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </li>
            </ul>
          </ScrollableNav>
        </section>

        <!-- ── Vehicles ──────────────────────────────────────────── -->
        <section>
          <div class="mb-3 flex items-center justify-between gap-4">
            <h2 class="flex items-center gap-2"><Icon name="carFront" /> Vehicles</h2>
            <Button
              v-if="canManageGroup || data?.rules.membersCanAddVehicles"
              variant="outline"
              size="sm"
              type="button"
              @click="showAddVehicleModal = true"
            >
              <PlusIcon class="mr-1.5" />
              Add Vehicle
            </Button>
          </div>

          <!-- Vehicle list -->
          <ul v-if="data?.vehicles?.length" class="card flex flex-col divide-y overflow-hidden">
            <li
              v-for="vehicle in data?.vehicles"
              :key="vehicle.data.id"
              class="group listHover flex items-center justify-between gap-4 px-3 py-2.5"
            >
              <VehicleItem :vehicle="vehicle.data" variant="small" />
              <Button
                class="shrink-0 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100"
                v-if="canManageGroup || data?.rules.membersCanAddVehicles"
                variant="ghost"
                size="icon"
                @click="
                  showRemoveVehicleAlert = true;
                  pendingVehicleRemoval = { groupId: data.id, vehicleId: vehicle.data.id };
                "
              >
                <Icon name="trash" class="text-muted-foreground size-4" />
              </Button>
            </li>
          </ul>

          <!-- Vehicles empty state -->
          <Empty v-else>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon name="carFront" />
              </EmptyMedia>
              <EmptyTitle>No vehicles in this group</EmptyTitle>
              <EmptyDescription>Add a vehicle to start tracking it as a group.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>
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
            <li
              v-for="vehicle in data?.vehicles.filter((v) => v.owner.id === pendingMemberRemoval?.member.user.id)"
              :key="vehicle.data.id"
            >
              <VehicleItem :vehicle="vehicle.data" variant="small" />
            </li>
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

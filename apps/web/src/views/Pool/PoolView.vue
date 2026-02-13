<script setup lang="ts">
import { useCurrentPool } from "@/lib/composables/useCurrentPool";
import { usePoolDetails } from "@/lib/queries/pools/pool-queries";
import { computed, watchEffect } from "vue";
import PoolManagementDropdown from "./components/PoolManagementDropdown.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import {
  getPoolInviteStateNameKey,
  getPoolMemberRoleNameKey,
  POOL_MEMBER_ROLES,
  PoolInviteSchema,
  type PoolMemberRoleCode,
} from "@repo/validation";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import Label from "@/components/ui/label/Label.vue";
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
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { usePoolInviteCancel, usePoolInviteUser, usePoolUpdateUserRole } from "@/lib/queries/pools/pool-mutations";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";
import PoolLoadingSkeleton from "./components/PoolLoadingSkeleton.vue";
import PoolErrorState from "./components/PoolErrorState.vue";
import { useModalStore } from "@/stores/modal";
import type { AlertModalData } from "@/modals/alertModal.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";

const modalStore = useModalStore();
const { currentUser } = useCurrentUser();
const { currentPoolId } = useCurrentPool();
const { mutateAsync: sendPoolInvite, isPending: isInviting } = usePoolInviteUser();
const { mutateAsync: cancelPoolInvite } = usePoolInviteCancel();
const { mutateAsync: updateRole } = usePoolUpdateUserRole();
const { data, isLoading, isError } = usePoolDetails(computed(() => currentPoolId.value));
watchEffect(() => {
  if (isError.value) {
    toast.error("Failed to load pool details.");
  }
});
const canManagePool = computed(() => {
  if (!data.value) return false;
  return ["OWNER", "ADMIN"].includes(data.value.userRole);
});

const { handleSubmit, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(PoolInviteSchema),
  initialValues: {
    email: "",
    roleToGrant: undefined,
  },
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Submitting invite with values:", values);
  await sendPoolInvite(values, {
    onSuccess: () => {
      resetForm();
      toast.success("Pool invite sent successfully.");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setFieldError("email", "No user found with this email.");
          return;
        }
      }
    },
  });
});

function handleRoleUpdate(poolId: string, userId: string, role: PoolMemberRoleCode) {
  if (role === "OWNER") {
    modalStore.onOpen("alert", {
      title: "Transfer Pool Ownership",
      description:
        "Are you sure you want to transfer ownership of this pool? You will lose your admin privileges and the new owner will have full control over the pool.",
      actionButton: {
        label: "Transfer Ownership",
        class: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
      },
      onAction: async () => {
        await updateRole(
          {
            poolId,
            userId,
            role,
          },
          {
            onSuccess: () => {
              toast.success("Pool ownership transferred successfully.");
            },
            onError: () => {
              toast.error("Failed to transfer pool ownership.");
            },
          },
        );
      },
    } satisfies AlertModalData);
  } else {
    updateRole(
      {
        poolId,
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
}
</script>

<template>
  <div class="flex min-w-0 flex-1 justify-center p-4 lg:p-8">
    <Transition name="fade" mode="out-in">
      <!-- Loading Skeleton -->
      <PoolLoadingSkeleton v-if="isLoading" />

      <!-- Error State -->
      <PoolErrorState v-else-if="isError" />

      <!-- Main Content -->
      <div v-else-if="data" class="mx-auto flex w-full flex-col lg:max-w-7xl">
        <header class="mb-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold tracking-tight">{{ data?.name }}</h1>
            <div class="flex items-center gap-8">
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" class="px-3 text-base">
                    {{ getPoolMemberRoleNameKey(data?.userRole) }}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Your role in this pool</TooltipContent>
              </Tooltip>

              <PoolManagementDropdown v-if="!isLoading && !isError" :details="data" />
            </div>
          </div>
          <CardDescription class="text-base">{{ data.description }}</CardDescription>
          <Separator class="mt-2" />
        </header>
        <div class="space-y-6 lg:space-y-10">
          <template v-if="data?.type === 'SHARED'">
            <h3 class="mb-2 flex items-center gap-2"><Icon name="users" /> Members</h3>
            <div class="space-y-4">
              <!-- New member invite form -->
              <form v-if="canManagePool" @submit="onSubmit" class="space-y-2">
                <Label>Invite a new member</Label>
                <Field name="poolId" type="hidden" :value="currentPoolId" />
                <div class="grid grid-cols-2 gap-4 lg:flex">
                  <Input name="email" type="email" placeholder="user@example.com" class="col-span-2 flex-1" />
                  <div>
                    <Field v-slot="{ value, handleChange }" name="roleToGrant">
                      <Select :model-value="value" @update:model-value="handleChange">
                        <SelectTrigger class="h-fit w-full lg:w-32">
                          <SelectValue placeholder="user role" />
                        </SelectTrigger>
                        <SelectContent align="center">
                          <SelectLabel>user Role</SelectLabel>

                          <SelectItem
                            v-for="role in Object.values(POOL_MEMBER_ROLES).filter((r) => r.code !== 'OWNER')"
                            :key="role.code"
                            :value="role.code"
                          >
                            {{ role.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="roleToGrant" class="text-destructive mt-1 ml-2 text-sm" />
                    </Field>
                  </div>
                  <Button type="submit" :disabled="isInviting">
                    <Icon name="userPlus" class="mr-2" />
                    Send Invite
                  </Button>
                </div>
              </form>

              <div class="space-y-2">
                <Label>Members with access</Label>

                <!-- Users table -->
                <ScrollArea class="max-h-96 overflow-hidden rounded border">
                  <ul>
                    <li
                      v-for="member in data?.members"
                      :key="member.user.id"
                      class="listHover grid items-center gap-4 rounded p-2.5 lg:gap-6"
                      :class="[canManagePool ? 'grid-cols-[auto_1fr_auto_auto]' : 'grid-cols-[auto_1fr_auto]']"
                    >
                      <Avatar class="h-8 w-8 rounded-lg">
                        <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'user'" />
                        <AvatarFallback class="rounded-lg">{{ getInitials(member.user.name) }}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p class="leading-tight font-semibold">{{ member.user.name }}</p>
                        <p class="text-muted-foreground text-sm">{{ member.user.email }}</p>
                      </div>
                      <div>
                        <DropdownMenu v-if="canManagePool">
                          <DropdownMenuTrigger asChild :disabled="member.role === 'OWNER'">
                            <Button variant="outline" size="sm" class="gap-2">
                              {{ getPoolMemberRoleNameKey(member.role) }}
                              <Icon name="chevronDown" class="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" class="w-48">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <Separator />
                            <DropdownMenuItem
                              v-for="role in Object.values(POOL_MEMBER_ROLES).filter(
                                (r) => r.code !== 'OWNER' || data?.userRole === 'OWNER',
                              )"
                              :key="role.code"
                              :checked="member.role === role.code"
                              :disabled="member.role === role.code"
                              @select="handleRoleUpdate(data.id, member.user.id, role.code as PoolMemberRoleCode)"
                            >
                              <div class="flex w-full items-center justify-between">
                                <span>{{ role.label }}</span>
                                <Badge v-if="member.role === role.code" variant="secondary" class="text-xs">
                                  Current
                                </Badge>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge v-else variant="outline" class="text-base">{{
                          getPoolMemberRoleNameKey(member.role)
                        }}</Badge>
                      </div>

                      <div v-if="canManagePool" class="w-6">
                        <DropdownMenu v-if="member.role !== 'OWNER'">
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
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge class="px-3 text-base" variant="secondary">{{
                            getPoolInviteStateNameKey(invite.state)
                          }}</Badge>
                        </TooltipTrigger>
                        <TooltipContent> Waiting for user to respond to the invite. </TooltipContent>
                      </Tooltip>
                      <div>
                        <Select v-if="canManagePool" disabled>
                          <SelectTrigger>
                            <SelectValue :placeholder="getPoolMemberRoleNameKey(invite.roleToGrant)" />
                          </SelectTrigger>
                        </Select>
                        <Badge v-else variant="outline" class="">{{
                          getPoolMemberRoleNameKey(invite.roleToGrant)
                        }}</Badge>
                      </div>

                      <DropdownMenu v-if="canManagePool">
                        <DropdownMenuTrigger>
                          <Icon name="dotsHorizontal" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Invite Actions</DropdownMenuLabel>
                          <DropdownMenuItem variant="destructive" @click="cancelPoolInvite(invite.id)">
                            <Icon name="close" /> Cancel Invite
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                  </ul>
                </ScrollArea>
              </div>
            </div>
          </template>

          <div class="space-y-2">
            <div class="flex items-end text-lg">
              <h3 class="flex items-center gap-2">
                <Icon name="carFront" /> Vehicles <Badge variant="secondary">{{ data?.vehicles.length }} </Badge>
              </h3>
              <Button
                v-if="canManagePool || data?.rules.allowMembersToaddVehicles"
                variant="default"
                class="ml-auto"
                size="sm"
              >
                Add Vehicle
              </Button>
            </div>

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
                    :items="[
                      {
                        label: 'Remove vehicle',
                        icon: 'logout',
                        disabled: true,
                        action: () => console.log('removed vehicle ', vehicle.data.name),
                      },
                    ]"
                    v-if="canManagePool || vehicle.isCurrentUserOwner"
                  >
                  </ResponsiveDropdown>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
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

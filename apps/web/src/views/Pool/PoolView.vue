<script setup lang="ts">
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import { useCurrentPool } from "@/lib/composables/useCurrentPool";
import { usePoolDetails } from "@/lib/queries/pools/pool-queries";
import { computed } from "vue";
import PoolManagementDropdown from "./components/PoolManagementDropdown.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import {
  getPoolInviteStateNameKey,
  getPoolMemberRoleNameKey,
  POOL_MEMBER_ROLES,
  PoolInviteSchema,
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
import { usePoolInviteCancel, usePoolInviteUser } from "@/lib/queries/pools/pool-mutations";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";

const { currentUser } = useCurrentUser();
const { currentPoolId } = useCurrentPool();
const { mutateAsync: sendPoolInvite, isPending: isInviting } = usePoolInviteUser();
const { mutateAsync: cancelPoolInvite } = usePoolInviteCancel();
const { data, isLoading, isError } = usePoolDetails(computed(() => currentPoolId.value));
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
</script>

<template>
  <div class="flex min-w-0 flex-1 justify-center p-4 lg:p-6">
    <Card class="h-fit w-full max-w-7xl">
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <h1>{{ data?.name }}</h1>
          <PoolManagementDropdown v-if="!isLoading && !isError" :details="data" />
        </CardTitle>
      </CardHeader>
      <Separator />

      <CardContent class="space-y-8">
        <template v-if="data?.type === 'SHARED'">
          <h3 class="mb-4 flex items-center gap-2"><Icon name="users" /> Members</h3>
          <div class="space-y-4">
            <form v-if="canManagePool" @submit="onSubmit" class="space-y-2">
              <Label>Invite a new member</Label>
              <Field name="poolId" type="hidden" :value="currentPoolId" />
              <div class="grid grid-cols-2 gap-4 lg:flex">
                <Input name="email" type="email" placeholder="user@example.com" class="col-span-2 flex-1" />
                <div>
                  <Field v-slot="{ value, handleChange }" name="roleToGrant">
                    <Select :model-value="value" @update:model-value="handleChange">
                      <SelectTrigger class="h-fit w-full lg:w-32">
                        <SelectValue placeholder="User role" />
                      </SelectTrigger>
                      <SelectContent align="center">
                        <SelectLabel>User Role</SelectLabel>

                        <SelectItem v-for="role in POOL_MEMBER_ROLES" :key="role.code" :value="role.code">
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
                    class="listHover grid grid-cols-[auto_1fr_auto_auto] items-center gap-8 p-4"
                  >
                    <Avatar class="h-8 w-8 rounded-lg">
                      <AvatarImage :src="member.user.image ?? ''" :alt="member.user.name ?? 'User'" />
                      <AvatarFallback class="rounded-lg">{{ getInitials(member.user.name) }}</AvatarFallback>
                    </Avatar>

                    <div>
                      <p class="leading-tight font-semibold">{{ member.user.name }}</p>
                      <p class="text-muted-foreground text-sm">{{ member.user.email }}</p>
                    </div>
                    <div>
                      <Select
                        v-if="canManagePool"
                        :disabled="data.userRole === 'OWNER' && member.user.id === currentUser?.id"
                      >
                        <SelectTrigger>
                          <SelectValue :placeholder="getPoolMemberRoleNameKey(member.role)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="role in POOL_MEMBER_ROLES" :key="role.code" :value="role.code">
                            {{ role.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge v-else variant="outline" class="text-base">{{
                        getPoolMemberRoleNameKey(member.role)
                      }}</Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Icon name="dotsHorizontal" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          variant="destructive"
                          :disabled="data.userRole === 'OWNER' && member.user.id === currentUser?.id"
                        >
                          <Icon name="logout" /> Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

        <div class="space-y-4">
          <div class="flex items-center text-lg">
            <h3 class="flex items-center gap-2">
              <Icon name="carFront" /> Vehicles <Badge variant="secondary">{{ data?.vehicles.length }} </Badge>
            </h3>
            <Button variant="default" class="ml-auto" size="sm"> Add Vehicle </Button>
          </div>

          <!-- Vehicle list -->
          <ScrollArea class="w-full overflow-hidden">
            <ul class="space-y-3 pb-3">
              <li
                v-for="vehicle in data?.vehicles"
                :key="vehicle.data.id"
                class="listHover grid min-w-3xl grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-6 rounded px-3 py-2"
              >
                <div class="bg-muted grid aspect-video h-16 place-items-center overflow-hidden rounded">
                  <img
                    v-if="vehicle.data.image"
                    :src="vehicle.data.image"
                    :alt="'Image of ' + vehicle.data.name"
                    class="object-cover"
                  />
                  <Icon
                    :name="vehicle.data.type.icon as IconProps['name']"
                    v-else-if="vehicle.data.type.icon"
                    class="stroke-muted-foreground"
                  />
                </div>

                <div>
                  <p class="font-semibold">{{ vehicle.data.name }}</p>
                  <p class="text-muted-foreground text-sm">{{ vehicle.data.make }} {{ vehicle.data.model }}</p>
                </div>
                <div v-if="vehicle.data.licensePlate">
                  <h4 class="text-muted-foreground">License Plate</h4>
                  <p class="text-sm">{{ vehicle.data.licensePlate }}</p>
                </div>
                <div v-else />
                <div>
                  <h4 class="text-muted-foreground">Odometer</h4>
                  <p class="text-sm">
                    {{ vehicle.data.odometerData.value }}
                    <span class="text-muted-foreground">{{ vehicle.data.odometerData.unit }}</span>
                  </p>
                </div>
                <div>
                  <h4 class="text-muted-foreground">Lifetime travel</h4>
                  <p class="text-sm">
                    {{ vehicle.data.odometerData.lifeTimeTracked }}
                    <span class="text-muted-foreground">{{ vehicle.data.odometerData.unit }}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Avatar>
                    <AvatarImage
                      v-if="vehicle.owner.image"
                      :src="vehicle.owner.image"
                      :alt="vehicle.owner.name ?? 'User'"
                    />
                    <AvatarFallback v-else class="rounded-lg">{{ getInitials(vehicle.owner.name) }}</AvatarFallback>
                  </Avatar>
                  {{ vehicle.owner.name || "Unknown User" }}
                </div>

                <DropdownMenu v-if="canManagePool || vehicle.isCurrentUserOwner">
                  <DropdownMenuTrigger>
                    <Icon name="dotsHorizontal" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem variant="destructive"> <Icon name="logout" /> Remove Vehicle </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
            <ScrollBar orientation="horizontal" class="" />
            <ScrollBar orientation="vertical" class="" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import Sidebar from "./sidebar/Sidebar.vue";
import SidebarHeader from "./sidebar/SidebarHeader.vue";
import SidebarMenu from "./sidebar/SidebarMenu.vue";
import SidebarMenuItem from "./sidebar/SidebarMenuItem.vue";
import SidebarContent from "./sidebar/SidebarContent.vue";
import SidebarGroup from "./sidebar/SidebarGroup.vue";
import SidebarMenuButton from "./sidebar/SidebarMenuButton.vue";
import SidebarGroupLabel from "@/components/ui/sidebar/SidebarGroupLabel.vue";
import SidebarGroupContent from "@/components/ui/sidebar/SidebarGroupContent.vue";
import SidebarMenuSub from "@/components/ui/sidebar/SidebarMenuSub.vue";
import SidebarMenuSubItem from "@/components/ui/sidebar/SidebarMenuSubItem.vue";
import SidebarMenuSubButton from "@/components/ui/sidebar/SidebarMenuSubButton.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useModalStore } from "@/stores/modal";
import { useSidebar } from "@/components/ui/sidebar/utils";
import AppLogo from "../icons/AppLogo.vue";
import Icon, { type IconProps } from "../icons/Icon.vue";
import Button from "./button/Button.vue";
import { usePoolsAll } from "@/lib/queries/pools/pool-queries";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import { useCurrentPool } from "@/lib/composables/useCurrentPool";

import { toast } from "vue-sonner";
import Separator from "@/components/ui/separator/Separator.vue";
import { useAuth } from "@/lib/authClient";
import { capitalize, formatBytesToMB } from "@/lib/utils";
import Label from "@/components/ui/label/Label.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import Progressbar from "@/components/ui/Progressbar.vue";
import NavUser from "@/components/NavUser.vue";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter.vue";

interface MainSideBarLinks {
  label: string;
  icon: IconProps["name"];
  to: string;
}

const mainSidebarLinks: MainSideBarLinks[] = [
  {
    label: "Dashboard",
    icon: "home",
    to: "/dashboard",
  },
  {
    label: "Notes",
    icon: "notes",
    to: "/notes",
  },
  {
    label: "To-dos",
    icon: "todo",
    to: "/todos",
  },
];
const { signOut } = useAuth();

const { data: vehicles } = useVehiclesAll();
const { currentVehicleId } = useCurrentVehicle();

const { data: pools } = usePoolsAll();
const { currentPoolId } = useCurrentPool();

const { currentUser: user, canCreateVehicle } = useCurrentUser();

const modalStore = useModalStore();
const { setOpenMobile } = useSidebar();

const handleCreateVehicleClick = () => {
  if (!canCreateVehicle.value) {
    toast.error("Vehicle Limit Reached", {
      description: "Please upgrade your plan to add more vehicles.",
      action: { label: "Upgrade", onClick: () => {} },
    });
    return;
  }
  modalStore.onOpen("createVehicle");
  setOpenMobile(false);
};
</script>

<template>
  <Sidebar class="">
    <SidebarHeader class="h-16 px-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <RouterLink to="/dashboard" class="flex items-center gap-3 rounded-md transition-colors duration-200">
            <AppLogo class="size-10" />
            <h1 class="text-lg font-semibold">RideFolio</h1>
          </RouterLink>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="bottom-safe-area">
      <SidebarGroup>
        <SidebarGroupContent class="space-y-1">
          <SidebarMenuItem :key="link.label" v-for="link in mainSidebarLinks">
            <SidebarMenuButton asChild class="">
              <RouterLink
                :to="link.to"
                class="hover:bg-accent! text-foreground/80 w-full"
                exact-active-class="bg-accent text-foreground!"
              >
                <Icon :name="link.icon" size="sm" />
                {{ link.label }}
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel class="text-sm">
          <span class="flex w-full items-center gap-3">
            <Icon name="carFront" class="text-inherit" />
            Vehicles
            <Button
              class="ml-auto"
              variant="ghost"
              size="icon-sm"
              :class="[!canCreateVehicle && 'opacity-50']"
              aria-label="Create vehicle"
              @click="handleCreateVehicleClick"
              data-cy="create-vehicle-button"
            >
              <Icon name="plus" />
            </Button>
          </span>
        </SidebarGroupLabel>
        <SidebarGroupContent v-if="vehicles && vehicles?.length > 0" class="mb">
          <SidebarMenuSub>
            <SidebarMenuSubItem v-for="vehicle in vehicles" :key="vehicle.vehicleData.id">
              <SidebarMenuSubButton asChild :isActive="currentVehicleId === vehicle.vehicleData.id">
                <RouterLink :to="`/vehicles/${vehicle.vehicleData.id}`" class="w-full">
                  <span>{{ vehicle.vehicleData.name }}</span>
                </RouterLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup data-slot="pools" class="mb-4">
        <SidebarGroupLabel class="text-sm select-none">
          <span class="flex items-center gap-3">
            <Icon name="users" size="sm" />
            Groups
          </span>

          <Button
            class="ml-auto"
            variant="ghost"
            size="icon-sm"
            @click="
              modalStore.onOpen('pool');
              setOpenMobile(false);
            "
          >
            <Icon name="plus" />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent v-if="pools && pools.length > 0">
          <SidebarMenuSub>
            <SidebarMenuSubItem v-for="pool in pools" :key="pool.id">
              <SidebarMenuSubButton asChild :is-active="currentPoolId === pool.id">
                <RouterLink :to="`/pools/${pool.id}`">{{ pool.name }}</RouterLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter class="mt-auto">
        <div v-if="user" class="bg-card my-2 space-y-2 rounded border px-3 py-2">
          <!--  headerl -->
          <div class="flex items-end justify-between gap-4">
            <Label class="text-muted-foreground wfu">Current Plan </Label>
            <Badge variant="secondary" class="ml-auto capitalize">{{ capitalize(user.subscriptionPlan.code) }}</Badge>
          </div>

          <!--  progress bar -->
          <Progressbar :percent="(user.usedStorageBytes / user.subscriptionPlan.maxStorageBytes) * 100" />
          <div class="flex justify-between">
            <span class="text-muted-foreground text-xs"> {{ formatBytesToMB(user.usedStorageBytes) }}MB used </span>
            <span v-if="user.subscriptionPlan.maxStorageBytes !== -1" class="text-muted-foreground text-xs">
              {{ formatBytesToMB(user.subscriptionPlan.maxStorageBytes) }}MB limit
            </span>
            <span v-else class="text-muted-foreground text-xs"> unlimited </span>
          </div>
        </div>

        <NavUser />
      </SidebarFooter>
    </SidebarContent>
  </Sidebar>
</template>

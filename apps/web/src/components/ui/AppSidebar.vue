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
import { twMerge } from "tailwind-merge";
import { useUserQuery } from "@/lib/queries/user/user-queries";
import Separator from "@/components/ui/separator/Separator.vue";

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

const { data: vehicles } = useVehiclesAll();
const { currentVehicleId } = useCurrentVehicle();

const { data: pools } = usePoolsAll();
const { currentPoolId } = useCurrentPool();

const { data: user } = useUserQuery();

const modalStore = useModalStore();
const { setOpenMobile } = useSidebar();

const handleCreateVehicleClick = () => {
  modalStore.onOpen("createVehicle");
  setOpenMobile(false);
};
</script>

<template>
  <Sidebar>
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

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="space-y-1">
          <SidebarMenuItem :key="link.label" v-for="link in mainSidebarLinks">
            <SidebarMenuButton asChild>
              <RouterLink :to="link.to" class="hover:bg-accent! w-full" exact-active-class="bg-accent">
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
            <Icon name="carFront" />
            Vehicles
            <button
              aria-label="Create vehicle"
              @click="handleCreateVehicleClick"
              data-cy="create-vehicle-button"
              class="hover:text-primary/90 hover:border-primary/50 ml-auto flex cursor-pointer items-center rounded-md border border-transparent p-1 transition-colors duration-200"
            >
              <Icon name="plus" />
            </button>
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
          <button
            @click="
              modalStore.onOpen('pool');
              setOpenMobile(false);
            "
            class="hover:text-primary/90 hover:border-primary/50 ml-auto flex cursor-pointer items-center rounded-md border border-transparent p-1 transition-colors duration-200"
          >
            <Icon name="plus" />
          </button>
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

      <SidebarGroup class="mt-auto">
        <SidebarGroupContent class="space-y-1">
          <div v-if="user" class="space-y-1 px-2">
            <!--  headerl -->
            <div class="flex justify-between gap-6">
              <div class="flex items-center gap-2 text-sm">Storage usage</div>
              <span class="text-muted-foreground text-xs">
                {{ ((user.storage.usage / user.storage.limit) * 100).toFixed(1) + "%" }}</span
              >
            </div>

            <!--  progress bar -->
            <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                :class="twMerge('bg-primary', 'h-2 rounded-full')"
                :style="{
                  width: user.storage?.usage
                    ? ((user.storage.usage / user.storage.limit) * 100).toFixed(1) + '%'
                    : '0%',
                }"
              />
            </div>
          </div>

          <Separator class="mt-3" />
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <RouterLink to="/settings" class="hover:bg-accent! w-full" exact-active-class="bg-accent">
                <Icon name="settings" size="sm" />
                Settings
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

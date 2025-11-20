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
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useAccessiblePools } from "@/lib/queries/useAccessiblePools";
import { useActivePool } from "@/lib/useActivePool";
import { useModalStore } from "@/stores/modal";
import { useSidebar } from "@/components/ui/sidebar/utils";
import AppLogo from "../icons/AppLogo.vue";
import Icon, { type IconProps } from "../icons/Icon.vue";
import { useVehicleQueries } from "@/lib/queries/useVehicleQueries";

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
    to: "",
  },
  {
    label: "To-dos",
    icon: "todo",
    to: "",
  },
];

const { vehicles } = useVehicleQueries();
const { activeVehicleId } = useActiveVehicle();

const { data: pools } = useAccessiblePools();
const { activePoolId } = useActivePool();

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
        <SidebarMenuButton :key="link.label" v-for="link in mainSidebarLinks" as-child>
          <RouterLink :to="link.to" class="flex items-center gap-3 font-semibold">
            <Icon :name="link.icon" />
            {{ link.label }}
          </RouterLink>
        </SidebarMenuButton>
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
              <SidebarMenuSubButton asChild :isActive="activeVehicleId === vehicle.vehicleData.id">
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
          <RouterLink
            to=""
            class="hover:text-primary/90 hover:border-primary/50 ml-auto flex items-center gap-2 rounded-md border border-transparent p-1 transition-colors duration-200"
          >
            <Icon name="plus" />
          </RouterLink>
        </SidebarGroupLabel>
        <SidebarGroupContent v-if="pools && pools.length > 0">
          <SidebarMenuSub class="gap-0">
            <SidebarMenuSubItem v-for="pool in pools" :key="pool.id">
              <SidebarMenuSubButton asChild :is-active="activePoolId === pool.id">
                <RouterLink :to="`/pools/${pool.id}`">{{ pool.name }}</RouterLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup class="mt-auto">
        <SidebarGroupContent class="space-y-4">
          <SidebarMenu class="gap-0">
            <SidebarMenuButton asChild>
              <RouterLink to="" class="flex items-center gap-3">
                <Icon name="settings" size="sm" /> Settings
              </RouterLink>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <RouterLink to="" class="flex items-center gap-3">
                <Icon name="subscription" size="sm" /> Upgrade to Pro
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

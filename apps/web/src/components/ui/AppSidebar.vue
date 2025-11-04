<script setup lang="ts">
import { RouterLink } from "vue-router";
import Sidebar from "./sidebar/Sidebar.vue";
import SidebarHeader from "./sidebar/SidebarHeader.vue";
import SidebarMenu from "./sidebar/SidebarMenu.vue";
import SidebarMenuItem from "./sidebar/SidebarMenuItem.vue";
import SidebarContent from "./sidebar/SidebarContent.vue";
import SidebarGroup from "./sidebar/SidebarGroup.vue";
import SidebarMenuButton from "./sidebar/SidebarMenuButton.vue";
import { Icons } from "@/components/utility/icons";
import SidebarGroupLabel from "@/components/ui/sidebar/SidebarGroupLabel.vue";
import SidebarGroupContent from "@/components/ui/sidebar/SidebarGroupContent.vue";
import SidebarMenuSub from "@/components/ui/sidebar/SidebarMenuSub.vue";
import SidebarMenuSubItem from "@/components/ui/sidebar/SidebarMenuSubItem.vue";
import SidebarMenuSubButton from "@/components/ui/sidebar/SidebarMenuSubButton.vue";
import { useAccessibleVehicles } from "@/lib/queries/useAccessibleVehicles";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useAccessiblePools } from "@/lib/queries/useAccessiblePools";
import { useActivePool } from "@/lib/useActivePool";
import { useModalStore } from "@/stores/modal";
import { useSidebar } from "@/components/ui/sidebar/utils";

const { data: vehicles } = useAccessibleVehicles();
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
    <SidebarHeader class="px-4 h-16">
      <SidebarMenu>
        <SidebarMenuItem>
          <RouterLink
            to="/dashboard"
            class="flex items-center gap-3 transition-colors duration-200 rounded-md"
          >
            <Icons.logo />
            <h1 class="text-lg font-semibold">RideFolio</h1>
          </RouterLink>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarMenuButton asChild>
          <RouterLink to="/dashboard" class="flex items-center gap-3 font-semibold">
            <Icons.home />
            Dashboard
          </RouterLink>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <RouterLink to="/notes" class="flex items-center gap-3 font-semibold">
            <Icons.notes />
            Muistiinpanot
          </RouterLink>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <RouterLink to="/notesold" class="flex items-center gap-3 font-semibold">
            <Icons.notes />
            Muistiinpanot vanha
          </RouterLink>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <RouterLink to="/to-dos" class="flex items-center gap-3 font-semibold">
            <Icons.todo size="sm" />
            Tehtävät
          </RouterLink>
        </SidebarMenuButton>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel class="text-sm">
          <span class="flex items-center gap-3 w-full">
            <Icons.carFront />
            Ajoneuvot
            <button
              aria-label="Lisää ajoneuvo"
              @click="handleCreateVehicleClick"
              class="ml-auto flex items-center cursor-pointer hover:text-primary/90 p-1 rounded-md border border-transparent hover:border-primary/50 transition-colors duration-200"
            >
              <Icons.plus />
            </button>
          </span>
        </SidebarGroupLabel>
        <SidebarGroupContent v-if="vehicles && vehicles?.length > 0" class="mb">
          <SidebarMenuSub>
            <SidebarMenuSubItem v-for="vehicle in vehicles" :key="vehicle.vehicleData.id">
              <SidebarMenuSubButton asChild :isActive="activeVehicleId === vehicle.vehicleData.id">
                <RouterLink :to="`/vehicles/${vehicle.vehicleData.id}`" class="w-full">
                  {{ vehicle.vehicleData.name }}
                </RouterLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup data-slot="pools" class="mb-4">
        <SidebarGroupLabel class="text-sm select-none">
          <span class="flex items-center gap-3">
            <Icons.users size="sm" />
            Ryhmät
          </span>
          <RouterLink
            to="/pools/new"
            class="ml-auto flex items-center gap-2 hover:text-primary/90 p-1 rounded-md border border-transparent hover:border-primary/50 transition-colors duration-200"
          >
            <Icons.plus />
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
              <RouterLink to="#" class="flex items-center gap-3">
                <Icons.settings size="sm" /> Asetukset
              </RouterLink>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <RouterLink to="/billing" class="flex items-center gap-3">
                <Icons.subscription size="sm" /> Upgrade to Pro
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

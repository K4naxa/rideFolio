<script setup lang="ts">
import { RouterLink } from "vue-router";
import Sidebar from "./sidebar/Sidebar.vue";
import SidebarHeader from "./sidebar/SidebarHeader.vue";
import SidebarMenuItem from "./sidebar/SidebarMenuItem.vue";
import SidebarContent from "./sidebar/SidebarContent.vue";
import SidebarGroup from "./sidebar/SidebarGroup.vue";
import SidebarMenuButton from "./sidebar/SidebarMenuButton.vue";
import SidebarGroupLabel from "@/components/ui/sidebar/SidebarGroupLabel.vue";
import SidebarGroupContent from "@/components/ui/sidebar/SidebarGroupContent.vue";
import SidebarMenuSub from "@/components/ui/sidebar/SidebarMenuSub.vue";
import SidebarMenuSubItem from "@/components/ui/sidebar/SidebarMenuSubItem.vue";
import SidebarMenuSubButton from "@/components/ui/sidebar/SidebarMenuSubButton.vue";
import { useModalStore } from "@/stores/modal";
import { useSidebar } from "@/components/ui/sidebar/utils";
import AppLogo from "../icons/AppLogo.vue";
import Icon, { type IconProps } from "../icons/Icon.vue";
import { usePoolsAll } from "@/lib/queries/pools/pool-queries";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import { useCurrentPool } from "@/lib/composables/useCurrentPool";

import { toast } from "vue-sonner";
import { capitalize, formatBytesToMB } from "@/lib/utils";
import Label from "@/components/ui/label/Label.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import Progressbar from "@/components/ui/Progressbar.vue";
import NavUser from "@/components/NavUser.vue";
import SidebarFooter from "@/components/ui/sidebar/SidebarFooter.vue";
import Icons from "@/components/icons/Icon.vue";
import NotificationsPopover from "@/components/ResponsiveNotification.vue";
import { computed } from "vue";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";

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

interface ActionOption {
  label: string;
  description: string;
  icon: IconProps["name"];
  onClick: () => void;
  iconBg: string;
  iconColor: string;
  cypressDataAttr: string;
}

const actionOptions = computed<ActionOption[]>(() => [
  {
    label: "Refill",
    description: "Log a fuel refill",
    icon: "refill",
    onClick: () => modalStore.onOpen("createRefill"),
    iconBg: "bg-refill",
    iconColor: "text-refill-foreground",
    cypressDataAttr: "create-refill-button",
  },
  {
    label: "Maintenance",
    description: "Log a service",
    icon: "maintenance",
    onClick: () => modalStore.onOpen("createMaintenance"),
    iconBg: "bg-maintenance",
    iconColor: "text-maintenance-foreground",
    cypressDataAttr: "create-maintenance-button",
  },
  {
    label: "Note",
    description: "Add a note",
    icon: "notes",
    onClick: () => modalStore.onOpen("createNote"),
    iconBg: "bg-notes",
    iconColor: "text-notes-foreground",
    cypressDataAttr: "create-note-button",
  },
  {
    label: "Todo",
    description: "Add a task",
    icon: "todo",
    onClick: () => modalStore.onOpen("createTodo"),
    iconBg: "bg-todo",
    iconColor: "text-todo-foreground",
    cypressDataAttr: "create-todo-button",
  },
]);

const { data: vehicles } = useVehiclesAll();

const { data: pools } = usePoolsAll();
const { currentPoolId } = useCurrentPool();

const { currentUser: user, canCreateVehicle } = useCurrentUser();

const isMobile = useIsMobile();

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
  <Sidebar class="h-full border-r">
    <SidebarHeader>
      <SidebarMenuItem class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <AppLogo class="size-7" />
          <h1 class="text-lg font-medium">RideFolio</h1>
        </div>
        <NotificationsPopover />
      </SidebarMenuItem>
    </SidebarHeader>

    <SidebarContent class="bottom-safe-area">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenuItem v-if="!isMobile">
            <Popover>
              <PopoverTrigger as-child>
                <sidebar-menu-button class="w-full">
                  <Icons name="plus" />
                  Add Activity
                </sidebar-menu-button>
              </PopoverTrigger>
              <PopoverContent align="end" class="flex flex-col gap-1 p-1">
                <button
                  v-for="option in actionOptions"
                  :key="option.label"
                  :data-cy="option.cypressDataAttr"
                  class="border-border hover:bg-sidebar-accent active:bg-muted flex items-center gap-3 rounded-md px-3 py-2 text-left"
                  @click="option.onClick()"
                >
                  <Icon :name="option.icon" :class="['size-5', option.iconColor]" />
                  <div>
                    <p class="text-foreground text-sm leading-tight font-semibold">{{ option.label }}</p>
                    <p class="text-muted-foreground text-xs leading-snug">{{ option.description }}</p>
                  </div>
                </button>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenuItem :key="link.label" v-for="link in mainSidebarLinks">
            <RouterLink custom v-slot="{ isActive, navigate }" :to="link.to">
              <SidebarMenuButton :isActive="isActive" @click="navigate">
                <Icon :name="link.icon" />
                {{ link.label }}
              </SidebarMenuButton>
            </RouterLink>
          </SidebarMenuItem>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <Icon name="carFront" />
          Vehicles
          <SidebarGroupAction
            :class="[!canCreateVehicle && 'opacity-50']"
            aria-label="Create vehicle"
            @click="handleCreateVehicleClick"
            data-cy="create-vehicle-button"
          >
            <Icon name="plus" />
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent v-if="vehicles && vehicles?.length > 0" class="mb">
          <SidebarMenuSub>
            <SidebarMenuSubItem v-for="vehicle in vehicles" :key="vehicle.vehicleData.id">
              <RouterLink :to="`/vehicles/${vehicle.vehicleData.id}`" v-slot="{ isActive, navigate }" custom>
                <SidebarMenuSubButton :is-active="isActive" @click="navigate">
                  {{ vehicle.vehicleData.name }}
                </SidebarMenuSubButton>
              </RouterLink>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup data-slot="pools" class="mb-4">
        <SidebarGroupLabel>
          <Icon name="users" />
          Groups

          <SidebarGroupAction
            class="ml-auto"
            variant="ghost"
            size="icon-sm"
            @click="
              modalStore.onOpen('pool');
              setOpenMobile(false);
            "
          >
            <Icon name="plus" />
          </SidebarGroupAction>
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

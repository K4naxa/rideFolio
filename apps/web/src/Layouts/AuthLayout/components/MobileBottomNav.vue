<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import Button from "@/components/ui/button/Button.vue";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import { RouteIcon } from "lucide-vue-next";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";

import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import { getInitials } from "@/lib/utils";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import { useAuth } from "@/lib/authClient";

const modalStore = useModalStore();
const { currentUser: user } = useCurrentUser();
const auth = useAuth();

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

const isCreateDrawerOpen = ref(false);
const isVehicleDrawerOpen = ref(false);
const isProfileDrawerOpen = ref(false);
const isMobile = useIsMobile();
const { data: vehicles } = useVehiclesAll();

function handleSettingsClick() {
  modalStore.onOpen("settings");
  isProfileDrawerOpen.value = false;
}

function handleLogout() {
  auth.signOut();
  isProfileDrawerOpen.value = false;
}
</script>

<template>
  <section v-if="isMobile">
    <div
      class="bg-background/85 bottom-safe-area! fixed bottom-0 z-20 grid w-screen grid-cols-5 items-center border-t px-1 py-1 backdrop-blur-md"
    >
      <!-- Dashboard -->
      <RouterLink
        to="/dashboard"
        active-class="text-primary!"
        class="text-muted-foreground active:text-primary flex h-fit flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.625rem] font-medium tracking-wide transition-colors duration-100"
      >
        <Icon name="home" class="size-6" />
        <span>Dashboard</span>
      </RouterLink>

      <!-- Vehicles Drawer -->
      <Drawer v-model:open="isVehicleDrawerOpen" placement="bottom">
        <DrawerTrigger asChild>
          <button
            class="text-muted-foreground active:text-primary flex h-fit flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.625rem] font-medium tracking-wide transition-colors duration-100"
          >
            <Icon name="carFront" class="size-6" />
            <span>Vehicles</span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Your Vehicles</DrawerTitle>
            <DrawerDescription>Navigate to a vehicle page</DrawerDescription>
          </DrawerHeader>
          <div class="scrollbar-thin flex max-h-[55vh] flex-col gap-1 overflow-y-auto overscroll-contain px-2 pb-5">
            <RouterLink
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleData.id"
              :to="`/vehicles/${vehicle.vehicleData.id}`"
              @click="isVehicleDrawerOpen = false"
              class="hover:bg-accent rounded-xl px-2 py-1 transition-colors duration-75"
            >
              <VehicleItem :vehicle="vehicle.vehicleData" />
            </RouterLink>
          </div>
        </DrawerContent>
      </Drawer>

      <!-- Create Action Drawer — centre FAB -->
      <Drawer v-model:open="isCreateDrawerOpen" placement="bottom">
        <DrawerTrigger asChild>
          <button
            aria-label="Create new"
            class="bg-primary mx-auto flex size-11 items-center justify-center rounded-full shadow-lg transition-transform duration-100 active:scale-95"
          >
            <Icon name="plus" class="text-primary-foreground size-6" />
          </button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader class="pb-1">
            <DrawerTitle class="text-lg">Create new</DrawerTitle>
            <DrawerDescription>What would you like to log?</DrawerDescription>
          </DrawerHeader>

          <div class="flex flex-col gap-3 px-4 pt-2 pb-6">
            <button
              v-for="option in actionOptions"
              :key="option.label"
              :data-cy="option.cypressDataAttr"
              class="border-border active:bg-muted flex items-start gap-4 rounded-2xl py-2 text-left"
              @click="
                option.onClick();
                isCreateDrawerOpen = false;
              "
            >
              <div :class="['flex size-11 items-center justify-center rounded-xl', option.iconBg]">
                <Icon :name="option.icon" :class="['size-7', option.iconColor]" />
              </div>
              <div>
                <p class="text-foreground leading-tight font-semibold">{{ option.label }}</p>
                <p class="text-muted-foreground text-sm leading-snug">{{ option.description }}</p>
              </div>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <!-- Timeline -->
      <RouterLink
        to="/timeline"
        active-class="text-primary!"
        class="text-muted-foreground active:text-primary flex h-fit flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.625rem] font-medium tracking-wide transition-colors duration-100"
      >
        <RouteIcon class="size-6" />
        <span>Timeline</span>
      </RouterLink>

      <!-- Profile Drawer -->
      <Drawer v-model:open="isProfileDrawerOpen" placement="bottom">
        <DrawerTrigger asChild>
          <button
            class="text-muted-foreground active:text-primary flex h-fit flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.625rem] font-medium tracking-wide transition-colors duration-100"
          >
            <Icon name="user" class="size-6" />
            <span>Profile</span>
          </button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader class="pb-3">
            <DrawerTitle class="sr-only">Profile</DrawerTitle>
            <DrawerDescription class="sr-only">Profile navigation menu</DrawerDescription>

            <!-- User identity card -->
            <div class="bg-accent/60 flex items-center gap-3 rounded-xl p-3">
              <Avatar class="size-14 rounded-xl">
                <AvatarImage v-if="user?.image" :src="user?.image" :alt="user?.name" />
                <AvatarFallback v-else class="bg-primary/15 text-primary rounded-xl text-xl font-bold">
                  {{ getInitials(user?.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="text-foreground truncate text-base leading-tight font-semibold">{{ user?.name }}</p>
                <p class="text-muted-foreground mt-0.5 truncate text-sm">{{ user?.email }}</p>
              </div>
            </div>
          </DrawerHeader>

          <!-- Menu items -->
          <nav class="flex flex-col gap-1 px-3 pb-2">
            <button
              class="text-foreground/80 active:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition-colors duration-75"
              @click="handleSettingsClick"
            >
              <Icon name="settings" class="size-6" />
              <span class="">Settings</span>
            </button>
          </nav>

          <DrawerFooter class="border-t py-0">
            <button
              class="text-foreground/80 active:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition-colors duration-75"
              @click="handleLogout"
            >
              <Icon name="logout" class="size-6" />
              <span class="">Log out</span>
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </section>
</template>

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

interface AppHeaderButton {
  label: string;
  icon: IconProps["name"];
  onClick: () => void;
  class: string;
  cypressDataAttr: string;
}
const actionOptions = computed<AppHeaderButton[]>(() => [
  {
    label: "Refill",
    icon: "refill",
    onClick: () => modalStore.onOpen("createRefill"),
    class: "shadow-refill/50 ",
    cypressDataAttr: "create-refill-button",
  },
  {
    label: "Maintenance",
    icon: "maintenance",
    onClick: () => modalStore.onOpen("createMaintenance"),
    class: "shadow-maintenance/50 ",
    cypressDataAttr: "create-maintenance-button",
  },
  {
    label: "Note",
    icon: "notes",
    onClick: () => modalStore.onOpen("createNote"),
    class: "shadow-notes/50 ",
    cypressDataAttr: "create-note-button",
  },
  {
    label: "Todo",
    icon: "todo",
    onClick: () => modalStore.onOpen("createTodo"),
    class: "shadow-todo/50 ",
    cypressDataAttr: "create-todo-button",
  },
]);

const isVehicleDrawerOpen = ref(false);
const isProfileDrawerOpen = ref(false);
const isMobile = useIsMobile();
const { data: vehicles } = useVehiclesAll();

const vehicleModalOpen = ref(false);

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
      class="bg-background/80 bottom-safe-area! fixed bottom-0 z-20 grid w-screen grid-cols-5 border-t p-1 backdrop-blur-sm"
    >
      <RouterLink to="/dashboard" class="bottom-nav-button" active-class="active">
        <Icon name="home" class="icon" /> Dashboard
      </RouterLink>

      <Drawer v-model:open="vehicleModalOpen" placement="bottom">
        <DrawerTrigger asChild>
          <button variant="ghost" class="bottom-nav-button"><Icon name="carFront" class="icon" /> Vehicles</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle> Your Vehicles </DrawerTitle>
            <DrawerDescription> Select what vehicles page you want to navigate to.</DrawerDescription>
          </DrawerHeader>
          <div class="p-4">
            <RouterLink
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleData.id"
              :to="`/vehicles/${vehicle.vehicleData.id}`"
              @click="vehicleModalOpen = false"
            >
              <VehicleItem :key="vehicle.vehicleData.id" :vehicle="vehicle.vehicleData" class="" />
            </RouterLink>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer v-model:open="isVehicleDrawerOpen" placement="bottom">
        <DrawerTrigger>
          <Button variant="outline" class="aspect-square size-10">
            <Icon name="plus" class="icon" />
          </Button>
        </DrawerTrigger>
        <DrawerContent class="">
          <DrawerHeader>
            <DrawerTitle> Create new </DrawerTitle>
            <DrawerDescription> Select an option below to create a new item. </DrawerDescription>
          </DrawerHeader>
          <div class="flex flex-col px-2">
            <Button
              variant="ghost"
              type="button"
              v-for="button in actionOptions"
              :key="button.label"
              @click="
                button.onClick();
                isVehicleDrawerOpen = false;
              "
              class="text-foreground flex w-full items-center justify-start gap-3 text-start text-base font-normal"
              :data-cy="button.cypressDataAttr"
            >
              <Icon :name="button.icon" class="size-5" />
              <span class="">{{ button.label }}</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <RouterLink to="#" class="bottom-nav-button"> <RouteIcon class="icon" /> Timelapse </RouterLink>

      <Drawer v-model:open="isProfileDrawerOpen" placement="bottom">
        <DrawerTrigger asChild>
          <button class="bottom-nav-button"><Icon name="user" class="icon" /> Profile</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle class="sr-only"> Profile nav </DrawerTitle>
            <DrawerDescription class="sr-only"> Choose what you want to do from the menu below. </DrawerDescription>

            <div class="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm">
              <Avatar class="h-12 w-12 rounded-lg">
                <AvatarImage v-if="user?.image" :src="user?.image || ''" :alt="user?.name" />
                <AvatarFallback v-else class="bg-accent rounded-lg text-lg">{{
                  getInitials(user?.name)
                }}</AvatarFallback>
              </Avatar>
              <div>
                <p class="truncate text-base font-medium">{{ user?.name }}</p>
                <p class="text-muted-foreground truncate text-sm">{{ user?.email }}</p>
              </div>
            </div>
          </DrawerHeader>
          <ul class="flex flex-col px-4">
            <Button variant="ghost" class="h-fit w-full justify-start" @click="handleSettingsClick">
              <Icon name="settings" class="size-5" /> Settings</Button
            >
          </ul>
          <DrawerFooter>
            <Button variant="secondary" class="w-full" @click="handleLogout"> Logout </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </section>
</template>

<style scoped>
.bottom-nav-button {
  color: var(--color-foreground);
  height: fit-content;
  font-size: small;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  padding: 0.5rem 0;
}
.bottom-nav-button:active {
  color: var(--color-primary);
}
.bottom-nav-button.active {
  color: var(--color-primary);
}
.bottom-nav-button:disabled {
  color: var(--color-foreground-muted);
  opacity: 0.5;
}
.bottom-nav-button .icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>

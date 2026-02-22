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
import Sheet from "@/components/ui/sheet/Sheet.vue";
import SheetTrigger from "@/components/ui/sheet/SheetTrigger.vue";
import SheetContent from "@/components/ui/sheet/SheetContent.vue";
import SheetHeader from "@/components/ui/sheet/SheetHeader.vue";

const modalStore = useModalStore();

interface AppHeaderButton {
  label: string;
  icon: IconProps["name"];
  onClick: () => void;
  class: string;
  cypressDataAttr: string;
}
const headerButtons = computed<AppHeaderButton[]>(() => [
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

const isDrawerOpen = ref(false);
const isMobile = useIsMobile();
const { data: vehicles } = useVehiclesAll();

const vehicleModalOpen = ref(false);
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

      <Drawer v-model:open="isDrawerOpen" placement="bottom">
        <DrawerTrigger>
          <Button variant="outline" class="aspect-square size-10">
            <Icon name="plus" class="icon" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle> Create new </DrawerTitle>
            <DrawerDescription> Select an option below to create a new item. </DrawerDescription>
          </DrawerHeader>
          <div class="flex flex-col px-2">
            <Button
              variant="ghost"
              type="button"
              v-for="button in headerButtons"
              :key="button.label"
              @click="
                button.onClick();
                isDrawerOpen = false;
              "
              class="text-foreground flex w-full items-center justify-start text-start text-base font-normal"
              :data-cy="button.cypressDataAttr"
            >
              <Icon :name="button.icon" />
              <span class="">{{ button.label }}</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <RouterLink to="#" class="bottom-nav-button"> <RouteIcon class="icon" /> Timelapse </RouterLink>

      <Sheet>
        <SheetTrigger asChild>
          <button class="bottom-nav-button"><Icon name="user" class="icon" /> Profile</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader> </SheetHeader>
        </SheetContent>
      </Sheet>
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
}
</style>

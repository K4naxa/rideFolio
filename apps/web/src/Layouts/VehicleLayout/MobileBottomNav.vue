<script setup lang="ts">
import { RouterLink } from "vue-router";
import MobileQuickAddButton from "../AuthLayout/MobileQuickAddButton.vue";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import UserDrawer from "@/components/drawers/UserDrawer.vue";
import Button from "@/components/ui/button/Button.vue";
import { icons } from "lucide-vue-next";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import { twMerge } from "tailwind-merge";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";

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
</script>

<template>
  <section v-if="isMobile">
    <div class="bottom-safe-area fixed bottom-0 z-20 flex w-screen justify-end px-4 md:hidden">
      <Drawer v-model:open="isDrawerOpen" placement="bottom">
        <DrawerTrigger>
          <Button variant="default" class="aspect-square h-fit rounded-full md:hidden">
            <Icon name="plus" class="size-10 stroke-2" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle> Create new </DrawerTitle>
            <DrawerDescription> Select an option below to create a new item. </DrawerDescription>
          </DrawerHeader>
          <div class="flex flex-col gap-4 p-4">
            <Button
              variant="outline"
              v-for="button in headerButtons"
              :key="button.label"
              @click="
                button.onClick();
                isDrawerOpen = false;
              "
              :class="twMerge('h-fit w-full rounded py-3 text-base font-medium shadow', button.class)"
              :data-cy="button.cypressDataAttr"
            >
              <Icon :name="button.icon" />
              <span class="">{{ button.label }}</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  </section>

  <!--  Old bottom navigation -->
  <!-- <div
    class="bottom-safe-area bg-background/80 fixed bottom-0 z-20 flex w-screen border-t px-2 shadow-md backdrop-blur-lg md:hidden"
  >
    <nav class="flex w-full items-center justify-evenly pt-2">
      <RouterLink
        to="/dashboard"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="home" class="mb-1 size-5" />
        <span class="text-xs">Home</span>
      </RouterLink>

      <RouterLink
        to="/notes"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="notes" class="mb-1 size-5" />
        <span class="text-xs">Notes</span>
      </RouterLink>

      <div class="flex flex-1 items-center justify-center">
        <MobileQuickAddButton />
      </div>

      <RouterLink
        to="/todos"
        class="text-muted-foreground hover:text-foreground router-link-active:text-primary flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors duration-200"
        active-class="text-primary"
      >
        <Icon name="todo" class="mb-1 size-5" />
        <span class="text-xs">Todos</span>
      </RouterLink>

      <UserDrawer />
    </nav>
  </div> -->
</template>

<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import Button from "@/components/ui/button/Button.vue";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import { twMerge } from "tailwind-merge";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";

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
          <div class="gaps-sm grid grid-cols-2 p-4">
            <Button
              variant="outline"
              v-for="button in headerButtons"
              :key="button.label"
              @click="
                button.onClick();
                isDrawerOpen = false;
              "
              :class="twMerge('aspect-video h-fit w-full rounded py-3 text-base font-medium shadow', button.class)"
              :data-cy="button.cypressDataAttr"
            >
              <Icon :name="button.icon" />
              <span class="">{{ button.label }}</span>
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" class="w-full"> Cancel </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </section>
</template>

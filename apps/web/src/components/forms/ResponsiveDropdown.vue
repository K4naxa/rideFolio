<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { ref, type HTMLAttributes } from "vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import Separator from "@/components/ui/separator/Separator.vue";

interface DropdownItem {
  label: string;
  icon?: IconProps["name"];
  action: () => void;
  disabled?: boolean;
}

interface Props {
  title?: string;
  items: DropdownItem[];
  description?: string;
  triggerClass?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
  align?: "start" | "center" | "end";
}

const props = withDefaults(defineProps<Props>(), {
  align: "end",
});

const emit = defineEmits<{
  action: [key: string];
}>();

const isMobile = useIsMobile();
const isOpen = ref(false);
</script>

<template>
  <!-- Desktop DropdownMenu -->
  <DropdownMenu v-if="!isMobile" v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon" :class="triggerClass">
          <Icon name="dotsHorizontal" class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="align" :class="contentClass">
      <DropdownMenuLabel v-if="title">{{ title }}</DropdownMenuLabel>
      <DropdownMenuSeparator v-if="title && items.length > 0" />
      <DropdownMenuItem v-for="item in items" :key="item.label" @click="item.action" :disabled="item.disabled">
        <Icon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Mobile Drawer -->
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon-sm" :class="triggerClass">
          <Icon name="dotsVertical" class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </slot>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <div class="flex justify-between gap-2">
          <slot name="header">
            <DrawerTitle>{{ title || "Options" }}</DrawerTitle>
            <DrawerDescription v-if="description">{{ description }}</DrawerDescription>
          </slot>
          <DrawerClose as-child>
            <Button variant="outline" class="mb-auto ml-auto" size="icon-sm">
              <Icon name="close" class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </div>
        <Separator class="mt-2" />
      </DrawerHeader>

      <div class="px-2 pb-2">
        <Button
          variant="ghost"
          type="button"
          v-for="item in items"
          :key="item.label"
          class="text-foreground flex w-full items-center justify-start text-start text-base font-normal"
          @click="
            () => {
              item.action();
              isOpen = false;
            }
          "
          :disabled="item.disabled"
        >
          <Icon v-if="item.icon" :name="item.icon" class="mr-2 h-4 w-4" />
          {{ item.label }}
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

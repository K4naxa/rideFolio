<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { type HTMLAttributes, ref } from "vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import Separator from "@/components/ui/separator/Separator.vue";

interface DropdownItem {
  label: string;
  icon?: IconProps["name"];
  action: () => void;
  disabled?: boolean;
  hidden?: boolean;
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

const isMobile = useIsMobile();
const isOpen = ref(false);

defineSlots<{
  trigger: (props: { close?: () => void }) => void;
  header: (props: { close: () => void }) => void;
}>();
</script>

<template>
  <!-- Desktop DropdownMenu -->
  <DropdownMenu v-if="!isMobile" v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon" :class="props.triggerClass">
          <Icon name="dotsHorizontal" class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="props.align" :class="props.contentClass">
      <DropdownMenuLabel v-if="props.title">{{ props.title }}</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in props.items"
        v-show="!item.hidden"
        :key="item.label"
        @click="item.action"
        :disabled="item.disabled"
      >
        <Icon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Mobile Drawer -->
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon-sm" :class="props.triggerClass">
          <Icon name="dotsVertical" class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </slot>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <template v-if="$slots.header">
          <DrawerTitle class="sr-only">{{ props.title || "Options" }}</DrawerTitle>
          <DrawerDescription class="sr-only">{{ props.description || "Available actions" }}</DrawerDescription>
          <slot name="header" :close="() => (isOpen = false)" />
        </template>
        <template v-else>
          <DrawerTitle>{{ props.title || "Options" }}</DrawerTitle>
          <DrawerDescription v-if="props.description">{{ props.description }}</DrawerDescription>
        </template>
        <Separator class="mt-2" />
      </DrawerHeader>

      <div class="flex flex-col gap-1 overflow-y-auto overscroll-contain px-2 pb-2">
        <Button
          variant="menu"
          type="button"
          v-for="item in props.items"
          v-show="!item.hidden"
          :key="item.label"
          @click="
            () => {
              item.action();
              isOpen = false;
            }
          "
          :disabled="item.disabled"
        >
          <Icon v-if="item.icon" :name="item.icon" />
          {{ item.label }}
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

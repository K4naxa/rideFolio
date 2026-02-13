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
        <slot name="header">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription v-if="description">{{ description }}</DrawerDescription>
        </slot>
      </DrawerHeader>

      <div class="flex flex-col gap-2.5 px-4 pb-4">
        <Button
          variant="outline"
          type="button"
          v-for="item in items"
          :key="item.label"
          class="flex h-fit items-center justify-start text-start text-base font-medium"
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
      <DrawerFooter class="pt-2">
        <DrawerClose as-child>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

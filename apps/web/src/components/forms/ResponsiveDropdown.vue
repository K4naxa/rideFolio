<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ref, type Component, type HTMLAttributes } from "vue";

export interface DropdownAction {
  key: string;
  label: string;
  icon?: Component;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean; // Add separator before this item
}

interface Props {
  actions: DropdownAction[];
  title?: string;
  description?: string;
  triggerClass?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
  align?: "start" | "center" | "end";
}

const props = withDefaults(defineProps<Props>(), {
  title: "Actions",
  description: "",
  align: "end",
});

const emit = defineEmits<{
  action: [key: string];
}>();

const isMobile = useIsMobile();
const isOpen = ref(false);

function handleAction(key: string) {
  emit("action", key);
  isOpen.value = false;
}
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
      <template v-for="action in actions" :key="action.key">
        <DropdownMenuSeparator v-if="action.separator" />
        <DropdownMenuItem
          :disabled="action.disabled"
          :class="action.variant === 'destructive' && 'text-destructive focus:text-destructive'"
          @click="handleAction(action.key)"
        >
          <component :is="action.icon" v-if="action.icon" class="mr-2 h-4 w-4" />
          {{ action.label }}
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Mobile Drawer -->
  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon" :class="triggerClass">
          <Icon name="dotsHorizontal" class="h-4 w-4" />
          <span class="sr-only">Open menu</span>
        </Button>
      </slot>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle>{{ title }}</DrawerTitle>
        <DrawerDescription v-if="description">{{ description }}</DrawerDescription>
      </DrawerHeader>
      <div class="px-4 pb-4">
        <div class="flex flex-col gap-1">
          <template v-for="action in actions" :key="action.key">
            <div v-if="action.separator" class="bg-border my-2 h-px" />
            <Button
              variant="ghost"
              :disabled="action.disabled"
              :class="[
                'h-12 justify-start text-base',
                action.variant === 'destructive' && 'text-destructive hover:text-destructive hover:bg-destructive/10',
              ]"
              @click="handleAction(action.key)"
            >
              <component :is="action.icon" v-if="action.icon" class="mr-3 h-5 w-5" />
              {{ action.label }}
            </Button>
          </template>
        </div>
      </div>
      <DrawerFooter class="pt-2">
        <DrawerClose as-child>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

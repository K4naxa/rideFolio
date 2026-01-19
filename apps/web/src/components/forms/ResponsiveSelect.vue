<script setup lang="ts" generic="T extends string | number">
import Icon from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { computed, ref, type Component, type HTMLAttributes } from "vue";

export interface ResponsiveSelectOption<T> {
  value: T;
  label: string;
  icon?: Component;
  symbol?: string;
}
interface Props {
  options: ResponsiveSelectOption<T>[];
  modelValue?: T;
  placeholder?: string;
  title?: string;
  description?: string;
  triggerClass?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
  title: "Select Option",
  description: "",
  triggerClass: "",
  contentClass: "",
});
const emit = defineEmits<{ "update:modelValue": [value: T]; select: [value: T] }>();

const isMobile = useIsMobile();
const isOpen = ref(false);
const selectedLabel = computed(() => {
  if (props.modelValue === undefined) return props.placeholder;
  const option = props.options.find((opt) => opt.value === props.modelValue);
  return option?.label ?? props.placeholder;
});

function handleSelect(value: T) {
  emit("update:modelValue", value);
  emit("select", value);
  isOpen.value = false;
}
</script>

<template>
  <DropdownMenu v-if="!isMobile" v-model:open="isOpen">
    <DropdownMenuTrigger>
      <Button variant="outline" size="sm" :class="['flex items-center justify-between gap-2', triggerClass]">
        <span class="truncate">{{ selectedLabel }}</span>
        <Icon name="chevronDown" class="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :class="contentClass" align="start" :sameWidth="true">
      <DropdownMenuItem
        v-for="option in options"
        :key="String(option.value)"
        :class="{ 'bg-accent': modelValue === option.value }"
        @click="handleSelect(option.value)"
      >
        <component :is="option.icon" v-if="option.icon" class="mr-2 h-4 w-4" /> {{ option.label }}
        <span v-if="option.symbol" class="ml-2">{{ option.symbol }}</span>
        <Icon name="check" v-if="modelValue === option.value" class="ml-auto h-4 w-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot name="trigger">
        <Button variant="outline" size="sm" :class="['flex items-center justify-between gap-2', triggerClass]">
          <span class="truncate">{{ selectedLabel }}</span>
          <Icon name="chevronDown" class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </slot>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader v-if="title || description" class="text-left">
        <DrawerTitle v-if="title">{{ title }}</DrawerTitle>
        <DrawerDescription v-if="description"> {{ description }} </DrawerDescription>
      </DrawerHeader>
      <div class="px-4 pb-4">
        <div class="flex flex-col gap-1">
          <Button
            v-for="option in options"
            :key="String(option.value)"
            variant="ghost"
            :class="['h-12 justify-start text-base', modelValue === option.value && 'bg-accent']"
            @click="handleSelect(option.value)"
          >
            <span v-if="option.symbol" class="mr-2">{{ option.symbol }}</span>
            <component :is="option.icon" v-if="option.icon" class="mr-3 h-5 w-5" />
            {{ option.label }}
            <Icon name="check" v-if="modelValue === option.value" class="stroke-primary ml-auto h-5 w-5" />
          </Button>
        </div>
      </div>
      <DrawerFooter class="pt-2">
        <DrawerClose as-child> <Button variant="outline">Cancel</Button> </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts" generic="T extends string | number">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { computed, ref, type Component, type HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";

export interface ResponsiveSelectOption<T> {
  value: T;
  label: string;
  icon?: IconProps["name"] | null;
  symbol?: string;
  disabled?: boolean;
}

interface Props {
  options: ResponsiveSelectOption<T>[];
  modelValue?: T;
  placeholder?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  triggerClass?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
  inputStyle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
  title: "Select Option",
  description: "",
  disabled: false,
  inputStyle: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: T];
  select: [value: T];
}>();

const isMobile = useIsMobile();
const isDrawerOpen = ref(false);

const selectedOption = computed(() => props.options.find((opt) => opt.value === props.modelValue));

function handleSelect(value: T) {
  emit("update:modelValue", value);
  emit("select", value);
  isDrawerOpen.value = false;
}

// Convert value for Select component (requires string)
function toSelectValue(value: T | undefined): string {
  return value !== undefined ? String(value) : "";
}

function fromSelectValue(value: string): T {
  const option = props.options.find((opt) => String(opt.value) === value);
  console.log("fromSelectValue:", value, option);
  return option?.value as T;
}
</script>

<template>
  <!-- Desktop -->
  <Select
    v-if="!isMobile"
    :model-value="toSelectValue(modelValue)"
    :disabled="disabled"
    @update:model-value="(value) => handleSelect(fromSelectValue(String(value)))"
  >
    <SelectTrigger :class="twMerge('w-full', inputStyle ? 'bg-input border-border text-base' : '', triggerClass)">
      <template v-if="selectedOption">
        <span class="placeholder:text-muted-foreground text-foreground flex items-center gap-2">
          <Icon :name="selectedOption.icon" v-if="selectedOption.icon" class="h-4 w-4" />
          <span v-if="selectedOption.symbol" class="text-muted-foreground">{{ selectedOption.symbol }} </span>
          {{ selectedOption.label }}
        </span>
      </template>
      <SelectValue v-else :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent :class="contentClass">
      <SelectItem
        v-for="option in options"
        :key="String(option.value)"
        :value="String(option.value)"
        :disabled="option.disabled"
      >
        <span class="flex items-center gap-2">
          <Icon :name="option.icon" v-if="option.icon" class="h-4 w-4" />
          <span v-if="option.symbol" class="text-muted-foreground">{{ option.symbol }}</span>
          {{ option.label }}
        </span>
      </SelectItem>
    </SelectContent>
  </Select>

  <!-- Mobile Drawer -->
  <Drawer v-else v-model:open="isDrawerOpen">
    <DrawerTrigger as-child>
      <Button
        role="combobox"
        :disabled="disabled"
        variant="outline"
        :class="
          twMerge(
            'w-full justify-between font-normal',
            !modelValue && 'text-muted-foreground',
            inputStyle ? 'bg-input! border-border! h-fit border px-3 py-2! text-base' : '',
            triggerClass,
          )
        "
      >
        <span v-if="selectedOption" class="flex items-center gap-2">
          <Icon :name="selectedOption.icon" v-if="selectedOption.icon" class="h-4 w-4" />
          <span v-if="selectedOption.symbol">{{ selectedOption.symbol }}</span>
          {{ selectedOption.label }}
        </span>
        <span v-else>{{ placeholder }}</span>
        <Icon name="chevronDown" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle>{{ title }}</DrawerTitle>
        <DrawerDescription v-if="description">{{ description }}</DrawerDescription>
      </DrawerHeader>
      <div class="px-4 pb-4">
        <ul class="divide-border flex flex-col gap-1 divide-y" role="listbox">
          <li
            v-for="option in options"
            :key="String(option.value)"
            :aria-selected="modelValue === option.value"
            :disabled="option.disabled"
            :class="twMerge('flex h-12 items-center justify-start text-base', modelValue === option.value && '')"
            @click="handleSelect(option.value)"
          >
            <Icon :name="option.icon" v-if="option.icon" class="mr-3 h-5 w-5" />
            <span v-if="option.symbol" class="text-muted-foreground mr-2">{{ option.symbol }}</span>
            {{ option.label }}
            <Icon v-if="modelValue === option.value" name="check" class="text-primary ml-auto h-5 w-5" />
          </li>
        </ul>
      </div>
      <DrawerFooter class="pt-2">
        <DrawerClose as-child>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

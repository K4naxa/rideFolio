<script setup lang="ts" generic="T">
import Icon from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
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
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { twMerge } from "tailwind-merge";
import { computed, ref, watch } from "vue";

interface Props {
  modelValue?: T | null;
  items: T[];

  labelKey: string;
  labelFn?: (item: T) => string;
  //   labelI18nKey?: string;
  valueKey: string;

  placeholder?: string;
  description?: string;
  emptyMessage?: string;

  disabled?: boolean;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select...",
});
const emit = defineEmits<{ "update:modelValue": [value: T | null] }>();
const isMobile = useIsMobile();
const isOpen = ref(false);
const isDrawerOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");

function handleInteractOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (inputRef.value?.contains(target) || inputRef.value === target) {
    event.preventDefault();

    return;
  }
}

const inputValue = computed(() => {
  // Always prioritize searchQuery when the user is actively typing
  if (searchQuery.value !== "") {
    return searchQuery.value;
  }
  // Only show the modelValue label when not typing
  if (props.modelValue && !isOpen.value) {
    return getLabel(props.modelValue);
  }
  return "";
});

const filteredItems = computed(() => {
  if (!props.items) return [];
  if (!searchQuery.value) return props.items;
  const query = searchQuery.value.toLowerCase();

  return props.items.filter((item) => {
    return getLabel(item).toLowerCase().includes(query);
  });
});
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;

  // Handle keyboard events
  if (event instanceof KeyboardEvent) {
    // Escape key closes the dropdown/drawer and clears input
    if (event.key === "Escape") {
      event.preventDefault();
      isOpen.value = false;
      target.blur();
      searchQuery.value = "";
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      const firstItem = filteredItems.value[0];
      if (firstItem !== undefined) {
        select(firstItem);
      }

      if (inputRef.value === document.activeElement) {
        inputRef.value?.blur();
      }
      return;
    }
  }

  // Update the search query for input events
  if (event.type === "input") {
    searchQuery.value = target.value;
  }
}

function handleFocus() {
  if (props.disabled) return;
  isOpen.value = true;
}

function getKey(item: T): string | number {
  return (item as never)[props.valueKey];
}
function getLabel(item: T): string {
  if (props.labelFn) {
    return props.labelFn(item);
  }

  return (item as never)[props.labelKey];
}

function select(item: T) {
  searchQuery.value = "";
  emit("update:modelValue", item);
  isOpen.value = false;
  isDrawerOpen.value = false;
}

function isSelected(item: T): boolean {
  if (!props.modelValue) return false;
  return getKey(item) === getKey(props.modelValue);
}

// Watch for external modelValue changes (e.g., when the parent resets selection)
watch(
  () => props.modelValue,
  (newValue) => {
    // If modelValue is cleared externally, reset a search query
    if (newValue === null || newValue === undefined) {
      searchQuery.value = "";
    }
  },
);
</script>

<template>
  <template v-if="!isMobile">
    <Popover v-model:open="isOpen">
      <PopoverAnchor as-child>
        <div class="relative">
          <input
            ref="inputRef"
            class="inputField"
            :value="inputValue"
            type="text"
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            @focus="handleFocus"
            @input="handleInput"
            @keydown="handleInput"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        @open-auto-focus.prevent
        @interact-outside="handleInteractOutside"
        class="min-w-(--reka-popover-trigger-width) p-2"
      >
        <div v-if="props.isLoading" class="flex items-center justify-center p-4">
          <Spinner class="mx-auto" />
        </div>
        <ScrollArea class="flex flex-col" v-else-if="filteredItems.length > 0">
          <button
            type="button"
            v-for="item in filteredItems"
            class="block"
            :key="getKey(item)"
            @click="select(item)"
            :class="
              twMerge(
                'flex w-full items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-start',
                'hover:bg-accent',
                item === props.modelValue ? 'bg-accent/50 font-medium' : '',
              )
            "
          >
            <slot name="item" :item="item"> {{ getLabel(item) }} </slot>
            <Icon name="circleCheck" v-if="isSelected(item)" class="float-right inline size-4" />
          </button>
        </ScrollArea>
        <div v-else class="text-muted-foreground p-4 text-center text-sm">
          {{ props.emptyMessage || "No items found." }}
        </div>
      </PopoverContent>
    </Popover>
  </template>

  <template v-else>
    <Drawer v-model:open="isDrawerOpen">
      <DrawerTrigger as-child>
        <button type="button" class="inputField flex items-center justify-between gap-4" :disabled="props.disabled">
          {{ inputValue || props.placeholder }}
          <Icon name="chevronDown" class="ml-2 size-4 opacity-50" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{{ props.placeholder }}</DrawerTitle>
          <DrawerDescription v-if="props.description">{{ props.description }}</DrawerDescription>
          <Separator class="mt-2" />
        </DrawerHeader>
        <div v-if="props.isLoading" class="flex items-center justify-center p-8">
          <Spinner />
        </div>
        <div v-else-if="filteredItems.length > 0" class="flex flex-col gap-2 px-4 pb-4" role="listbox">
          <button
            type="button"
            v-for="item in filteredItems"
            class="block"
            :key="getKey(item)"
            @click="select(item)"
            :class="
              twMerge(
                'flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-start',
                'hover:bg-accent',
                isSelected(item) ? 'bg-accent/50 font-medium' : '',
              )
            "
          >
            <Icon name="circleCheck" v-if="isSelected(item)" class="stroke-background fill-foreground inline" />
            <Icon name="circle" v-else class="float-right inline" />
            <slot name="item" :item="item"> {{ getLabel(item) }} </slot>
          </button>
        </div>
        <div v-else class="text-muted-foreground p-4 text-center text-sm">
          {{ props.emptyMessage || "No items found." }}
        </div>

        <DrawerFooter class="pt-2">
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </template>
</template>

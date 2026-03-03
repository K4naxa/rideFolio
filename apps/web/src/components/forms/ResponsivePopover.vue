<script setup lang="ts">
import { ref } from "vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const isOpen = ref(false);

const props = defineProps({
  title: String,
  description: String,
});

const isMobile = useIsMobile();

const close = () => {
  isOpen.value = false;
};

// Allow parent to call close() via template ref
defineExpose({ close, isOpen });
</script>

<template>
  <Drawer v-if="isMobile" v-model:open="isOpen">
    <DrawerTrigger as-child>
      <slot name="trigger" :close="close" :is-open="isOpen" />
    </DrawerTrigger>
    <DrawerContent class="">
      <DrawerHeader>
        <slot name="header" :close="close" :is-open="isOpen">
          <DrawerTitle>{{ props.title }}</DrawerTitle>
          <DrawerDescription v-if="props.description">
            {{ props.description }}
          </DrawerDescription>
        </slot>
      </DrawerHeader>

      <div class="px-4 py-4">
        <slot name="content" :close="close" :is-open="isOpen" />
      </div>

      <DrawerFooter>
        <slot name="footer" :close="close" :is-open="isOpen" />
      </DrawerFooter>
    </DrawerContent>
  </Drawer>

  <Popover v-else v-model:open="isOpen">
    <PopoverAnchor>
      <PopoverTrigger as-child>
        <slot name="trigger" :close="close" :is-open="isOpen" />
      </PopoverTrigger>
    </PopoverAnchor>

    <PopoverContent align="end" class="flex min-w-fit flex-col space-y-4" >
      <slot name="header" :close="close" :is-open="isOpen">
        <div>
          <Label class="text-lg font-semibold">{{ props.title }}</Label>
          <p v-if="props.description" class="text-muted-foreground text-sm">{{ props.description }}</p>
        </div>
      </slot>

      <div class="flex-1">
        <slot name="content" :close="close" :is-open="isOpen" />
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <slot name="footer" :close="close" :is-open="isOpen" />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped></style>

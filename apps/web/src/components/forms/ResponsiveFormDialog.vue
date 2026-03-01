<!-- ResponsiveFormDialog.vue -->
<script setup lang="ts">
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import type { HTMLAttributes } from "vue";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  /** Optional icon shown next to the title */
  icon?: IconProps["name"];
  /** Extra classes applied to the desktop DialogScrollContent (e.g. max-w-2xl) */
  contentClass?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "close"): void;
}>();

const isMobile = useIsMobile();

function handleOpenChange(value: boolean) {
  emit("update:open", value);
  if (!value) emit("close");
}
</script>

<template>
  <!-- Desktop: Dialog modal -->
  <template v-if="!isMobile">
    <Dialog :open="props.open" @update:open="handleOpenChange">
      <DialogScrollContent :class="['w-full', contentClass ?? 'max-w-lg']">
        <DialogHeader>
          <DialogTitle>
            <Icon v-if="icon" :name="icon" />
            {{ props.title }}
          </DialogTitle>
          <DialogDescription v-if="props.description">
            {{ props.description }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <slot />
        </div>

        <DialogFooter>
          <slot name="footer" />
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </template>

  <!-- Mobile: Bottom sheet drawer -->
  <template v-else>
    <Drawer :open="props.open" @update:open="handleOpenChange">
      <DrawerContent class="data-[vaul-drawer-direction=bottom]:max-h-[90vh]" dismiss-from-pill>
        <DrawerHeader class="border-b text-left">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1">
              <DrawerTitle class="flex items-center gap-2">
                <Icon v-if="icon" :name="icon" />
                {{ props.title }}
              </DrawerTitle>
              <DrawerDescription v-if="props.description" class="text-left text-xs">
                {{ props.description }}
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon-sm" class="mt-0.5 shrink-0" @click="handleOpenChange(false)">
              <Icon name="close" class="size-4" />
            </Button>
          </div>
        </DrawerHeader>

        <!-- Scrollable body -->
        <div class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain p-4">
          <div class="flex flex-1 flex-col gap-4">
            <slot />
          </div>

          <!--  Footer -->
          <div class="flex flex-col gap-2 [&>button]:w-full">
            <slot name="footer" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </template>
</template>

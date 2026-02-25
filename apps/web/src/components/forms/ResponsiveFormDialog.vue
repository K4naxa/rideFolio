<!-- ResponsiveFormDialog.vue -->
<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import Separator from "../ui/separator/Separator.vue";

const props = defineProps<{
  open: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const isMobile = useIsMobile();
</script>

<template>
  <!-- Desktop: Dialog -->
  <template v-if="!isMobile">
    <Dialog :open="open" @update:open="emit('update:open', $event)">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ props.title }}</DialogTitle>
          <DialogDescription v-if="props.description">
            {{ props.description }}
          </DialogDescription>
        </DialogHeader>
        <slot />

        <DialogFooter>
          <!-- Optional footer slot -->
          <slot name="footer" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>

  <!-- Mobile: Drawer -->
  <template v-else>
    <Drawer :open="open" @update:open="emit('update:open', $event)">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{{ props.title }}</DrawerTitle>
          <DrawerDescription v-if="props.description">
            {{ props.description }}
          </DrawerDescription>
          <Separator class="mt-2" />
        </DrawerHeader>

        <div class="gaps-md flex flex-col px-4 py-2 text-base">
          <slot />
        </div>

        <DrawerFooter>
          <!-- Optional footer slot -->
          <slot name="footer" />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </template>
</template>

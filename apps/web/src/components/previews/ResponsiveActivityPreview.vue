<script setup lang="ts">
import TodoActivityPreviewItem from "@/components/previews/todo/TodoActivityPreviewItem.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import PopoverContent from "@/components/ui/popover/PopoverContent.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import type { ActivityItem } from "@repo/validation";
import { ref } from "vue";

const isMobile = useIsMobile();

const props = defineProps<{
  item: ActivityItem;
}>();

const isOpen = ref(false);
</script>

<template>
  <template v-if="isMobile">
    <Dialog v-model:open="isOpen">
      <DialogTrigger as-child>
        <slot name="trigger" />
      </DialogTrigger>

      <DialogContent>
        <DialogTitle class="sr-only">Your activity</DialogTitle>
        <DialogDescription class="sr-only"> Manage your upcoming activity and view details here. </DialogDescription>
        <TodoActivityPreviewItem v-if="props.item.type === 'todo'" :activity="props.item.data" />
      </DialogContent>
    </Dialog>
  </template>

  <template v-else>
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child v-if="props.item.type === 'todo'">
        <slot name="trigger" />
      </PopoverTrigger>
      <PopoverContent side="top" class="cardBackground w-xs">
        <TodoActivityPreviewItem v-if="props.item.type === 'todo'" :activity="props.item.data" />
      </PopoverContent>
    </Popover>
  </template>
</template>

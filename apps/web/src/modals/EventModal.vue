<script setup lang="ts">
import TodoActivityPreview from "@/components/TodoActivityPreview.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import type { ActivityItem } from "@repo/validation";

const props = defineProps<{
  activity: ActivityItem;
}>();
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogContent class="w-md">
      <!-- Content -->
      <div class="">
        <template v-if="props.activity.type === 'todo'">
          <TodoActivityPreview :activity="props.activity" />
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>

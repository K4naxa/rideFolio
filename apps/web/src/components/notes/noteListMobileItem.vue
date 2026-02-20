<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import { getTextSnippet } from "@/lib/utils/noteUtils";
import type { Note } from "@repo/validation";

const props = defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e: "note-click", note: Note): void;
}>();

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
>

<template>
  <Card :class="['group gaps-sm w-full shrink-0 cursor-pointer']" @click="emit('note-click', note)">
    <CardContent class="flex w-full flex-col">
      <CardTitle class="flex min-w-0 justify-between gap-4 break-all">
        {{ note.title }}

        <div>
          <Icon v-if="note.pinned" name="pin" class="text-primary size-4" />
        </div>
      </CardTitle>
      <span v-if="note.content" class="text-muted-foreground mt-1 line-clamp-5 overflow-hidden text-sm break-all">
        {{ getTextSnippet(String(note.content), 500) }}
      </span>
    </CardContent>
    <CardFooter class="mt-auto flex flex-col items-start gap-2">
      <span class="text-muted-foreground ml-auto text-xs">Last edited: {{ formatDate(note.updatedAt) }}</span>
    </CardFooter>
  </Card>
</template>
